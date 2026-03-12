#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  LFTG Platform — Watchdog v2 avec alertes email/Telegram
#  Surveille tous les services critiques, les relance et envoie des alertes
# ─────────────────────────────────────────────────────────────────────────────
PLATFORM_DIR="/home/ubuntu/lftg-platform"
LOG_FILE="/home/ubuntu/lftg-platform/logs/watchdog.log"
ALERT_LOG="/home/ubuntu/lftg-platform/logs/alerts.log"
ALERT_CONF="/home/ubuntu/lftg-platform/alert.conf"

# Charger la configuration des alertes si elle existe
if [ -f "$ALERT_CONF" ]; then
  source "$ALERT_CONF"
fi

# Valeurs par défaut
ALERT_EMAIL="${ALERT_EMAIL:-}"
ALERT_TELEGRAM_TOKEN="${ALERT_TELEGRAM_TOKEN:-}"
ALERT_TELEGRAM_CHAT_ID="${ALERT_TELEGRAM_CHAT_ID:-}"
ALERT_COOLDOWN="${ALERT_COOLDOWN:-300}"  # 5 min entre deux alertes du même type
LAST_ALERT_FILE="/tmp/lftg-last-alerts"

# ─── Logging ─────────────────────────────────────────────────────────────────
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ─── Vérifier le cooldown d'une alerte ───────────────────────────────────────
can_alert() {
  local key="$1"
  local now=$(date +%s)
  local last=0
  if [ -f "$LAST_ALERT_FILE" ]; then
    last=$(grep "^${key}=" "$LAST_ALERT_FILE" 2>/dev/null | cut -d= -f2 || echo 0)
  fi
  local diff=$((now - last))
  if [ "$diff" -gt "$ALERT_COOLDOWN" ]; then
    # Mettre à jour le timestamp
    if [ -f "$LAST_ALERT_FILE" ]; then
      sed -i "/^${key}=/d" "$LAST_ALERT_FILE" 2>/dev/null
    fi
    echo "${key}=${now}" >> "$LAST_ALERT_FILE"
    return 0  # Peut alerter
  fi
  return 1  # Cooldown actif
}

# ─── Envoyer une alerte email via curl (SMTP Gmail) ──────────────────────────
send_email_alert() {
  local subject="$1"
  local body="$2"

  if [ -z "$ALERT_EMAIL" ]; then
    return 0
  fi

  # Utiliser l'API backend pour envoyer l'email (évite de configurer SMTP dans le script)
  local token
  token=$(curl -s -X POST http://localhost:80/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@lftg.fr\",\"password\":\"${ADMIN_PASSWORD:-admin123}\"}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken',''))" 2>/dev/null)

  if [ -n "$token" ]; then
    curl -s -X POST http://localhost:80/api/v1/monitoring/alert-email \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "{\"to\":\"${ALERT_EMAIL}\",\"subject\":\"[LFTG ALERTE] ${subject}\",\"body\":\"${body}\"}" \
      > /dev/null 2>&1
  fi
}

# ─── Envoyer une alerte Telegram ─────────────────────────────────────────────
send_telegram_alert() {
  local message="$1"

  if [ -z "$ALERT_TELEGRAM_TOKEN" ] || [ -z "$ALERT_TELEGRAM_CHAT_ID" ]; then
    return 0
  fi

  curl -s -X POST "https://api.telegram.org/bot${ALERT_TELEGRAM_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\":\"${ALERT_TELEGRAM_CHAT_ID}\",\"text\":\"🚨 LFTG ALERTE\\n${message}\",\"parse_mode\":\"HTML\"}" \
    > /dev/null 2>&1
}

# ─── Alerte complète (log + email + telegram) ────────────────────────────────
alert() {
  local key="$1"
  local message="$2"
  local hostname=$(hostname)
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  echo "[$timestamp] ALERTE: $message" | tee -a "$ALERT_LOG" "$LOG_FILE"

  if can_alert "$key"; then
    local full_msg="Serveur: ${hostname}\nHeure: ${timestamp}\n\n${message}"
    send_email_alert "$message" "$full_msg"
    send_telegram_alert "<b>${message}</b>\n\nServeur: ${hostname}\nHeure: ${timestamp}"
  fi
}

# ─── Vérifier et relancer un conteneur ───────────────────────────────────────
check_container() {
  local name="$1"
  local status
  status=$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null)
  if [ "$status" != "running" ]; then
    alert "container_${name}" "Conteneur $name est '$status' — tentative de redémarrage"
    docker start "$name" 2>/dev/null || docker restart "$name" 2>/dev/null
    sleep 5
    status=$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null)
    if [ "$status" = "running" ]; then
      log "✓ $name redémarré avec succès"
    else
      alert "container_${name}_failed" "✗ Impossible de redémarrer $name — intervention manuelle requise"
    fi
  fi
}

# ─── Vérifier la connectivité réseau entre conteneurs ────────────────────────
check_network() {
  local db_ok
  db_ok=$(docker exec lftg-backend-prod sh -c "nc -z postgres 5432 2>/dev/null && echo ok || echo fail" 2>/dev/null)
  if [ "$db_ok" != "ok" ]; then
    alert "network_db" "Backend ne peut pas joindre la base de données — reconnexion réseau"
    docker network connect lftg-platform_lftg-network lftg-backend-prod 2>/dev/null || true
    docker restart lftg-backend-prod
    sleep 8
    log "Backend reconnecté au réseau"
  fi
}

# ─── Vérifier les uploads ────────────────────────────────────────────────────
check_uploads() {
  local count_host count_container
  count_host=$(find "$PLATFORM_DIR/uploads" -type f 2>/dev/null | wc -l)
  count_container=$(docker exec lftg-backend-prod find /app/uploads -type f 2>/dev/null | wc -l)
  if [ "$count_host" != "$count_container" ]; then
    alert "uploads_sync" "Désynchronisation uploads: hôte=$count_host, conteneur=$count_container"
    docker restart lftg-backend-prod
    sleep 8
    log "Backend redémarré pour resynchroniser les uploads"
  fi
}

# ─── Vérifier l'espace disque ────────────────────────────────────────────────
check_disk_space() {
  local usage
  usage=$(df /var/lib/docker | awk 'NR==2 {print $5}' | tr -d '%')
  if [ "$usage" -gt 90 ]; then
    alert "disk_critical" "CRITIQUE: Espace disque Docker à ${usage}% — nettoyage d'urgence"
    docker image prune -f >> "$LOG_FILE" 2>&1
    docker system prune -f --volumes >> "$LOG_FILE" 2>&1
  elif [ "$usage" -gt 80 ]; then
    alert "disk_warning" "Espace disque Docker à ${usage}% — nettoyage préventif"
    docker image prune -f >> "$LOG_FILE" 2>&1
  fi
}

# ─── Vérifier la santé de l'API ──────────────────────────────────────────────
check_api_health() {
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/health 2>/dev/null)
  if [ "$http_code" != "200" ] && [ "$http_code" != "301" ] && [ "$http_code" != "302" ]; then
    alert "api_health" "API non accessible (HTTP $http_code) — redémarrage Nginx"
    docker restart lftg-nginx
    sleep 5
  fi
}

# ─── Programme principal ──────────────────────────────────────────────────────
mkdir -p "$PLATFORM_DIR/logs"
log "=== Watchdog LFTG v2 démarré ==="

check_container "lftg-postgres-prod"
check_container "lftg-redis-prod"
check_container "lftg-backend-prod"
check_container "lftg-frontend-prod"
check_container "lftg-nginx"

check_network
check_uploads
check_disk_space
check_api_health

log "=== Watchdog LFTG v2 terminé ==="
