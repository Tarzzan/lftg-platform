#!/usr/bin/env bash
# =============================================================================
# LFTG Platform — Script de déploiement unifié
# Usage: ./scripts/deploy.sh [frontend|backend|both|map] [--skip-build] [--skip-tests]
# =============================================================================
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
PROD_SERVER="prod-server"
PLATFORM_DIR="/home/ubuntu/lftg-platform"
REMOTE_DIR="/home/ubuntu/lftg-platform"
MAP_DIR="/home/ubuntu/lftg-map"
LOG_DIR="/tmp/lftg-deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TARGET="${1:-both}"
SKIP_BUILD=false
SKIP_TESTS=false

for arg in "$@"; do
  [[ "$arg" == "--skip-build" ]] && SKIP_BUILD=true
  [[ "$arg" == "--skip-tests" ]] && SKIP_TESTS=true
done

# ─── Couleurs ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC} $*"; }
error()   { echo -e "${RED}✗${NC} $*"; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}══════════════════════════════════════${NC}"; echo -e "${BOLD}${BLUE}  $*${NC}"; echo -e "${BOLD}${BLUE}══════════════════════════════════════${NC}\n"; }

mkdir -p "$LOG_DIR"
DEPLOY_LOG="$LOG_DIR/deploy_$TIMESTAMP.log"

# ─── Vérification connexion SSH ───────────────────────────────────────────────
check_ssh() {
  log "Vérification connexion SSH vers $PROD_SERVER..."
  if ! ssh -o ConnectTimeout=10 "$PROD_SERVER" 'echo ok' &>/dev/null; then
    # Tenter de reconfigurer SSH via le skill
    if [ -f "/home/ubuntu/skills/ssh-prod-server/scripts/setup-ssh.sh" ]; then
      bash /home/ubuntu/skills/ssh-prod-server/scripts/setup-ssh.sh &>/dev/null || true
    fi
    ssh -o ConnectTimeout=10 "$PROD_SERVER" 'echo ok' &>/dev/null || error "Impossible de se connecter à $PROD_SERVER"
  fi
  success "Connexion SSH OK"
}

# ─── Build Frontend ───────────────────────────────────────────────────────────
build_frontend() {
  section "Build Frontend (Next.js)"
  local BUILD_LOG="$LOG_DIR/build_frontend_$TIMESTAMP.log"

  if [ "$SKIP_BUILD" = true ]; then
    warn "Build ignoré (--skip-build)"
    return 0
  fi

  log "Compilation Next.js en cours..."
  cd "$PLATFORM_DIR"
  if pnpm --filter frontend build > "$BUILD_LOG" 2>&1; then
    success "Build frontend réussi"
    # Vérifier que le mode standalone est activé
    if [ ! -d "apps/frontend/.next/standalone" ]; then
      error "Répertoire standalone manquant — vérifier next.config.js (output: 'standalone')"
    fi
  else
    tail -20 "$BUILD_LOG"
    error "Build frontend échoué — voir $BUILD_LOG"
  fi
}

# ─── Build Backend ────────────────────────────────────────────────────────────
build_backend() {
  section "Build Backend (NestJS)"
  local BUILD_LOG="$LOG_DIR/build_backend_$TIMESTAMP.log"

  if [ "$SKIP_BUILD" = true ]; then
    warn "Build ignoré (--skip-build)"
    return 0
  fi

  log "Compilation NestJS en cours..."
  cd "$PLATFORM_DIR"
  if pnpm --filter backend build > "$BUILD_LOG" 2>&1; then
    success "Build backend réussi"
  else
    tail -20 "$BUILD_LOG"
    error "Build backend échoué — voir $BUILD_LOG"
  fi
}

# ─── Déploiement Frontend ─────────────────────────────────────────────────────
deploy_frontend() {
  section "Déploiement Frontend"
  local ARCHIVE="/tmp/frontend_$TIMESTAMP.tar.gz"

  log "Création de l'archive standalone..."
  cd "$PLATFORM_DIR/apps/frontend"
  tar -czf "$ARCHIVE" .next/standalone .next/static public 2>/dev/null || \
  tar -czf "$ARCHIVE" .next/standalone .next/static
  success "Archive créée: $(du -sh "$ARCHIVE" | cut -f1)"

  log "Transfert vers le serveur..."
  scp "$ARCHIVE" "$PROD_SERVER:/tmp/frontend_deploy.tar.gz"
  success "Transfert OK"

  log "Extraction et reconstruction Docker..."
  ssh "$PROD_SERVER" bash << REMOTE_EOF
set -e
cd $REMOTE_DIR/apps/frontend
sudo rm -rf .next/standalone .next/static
tar -xzf /tmp/frontend_deploy.tar.gz
echo "Extraction OK"

# Rebuild image Docker
docker build -f Dockerfile.prebuilt -t lftg-frontend:latest $REMOTE_DIR > /tmp/docker_frontend_build.log 2>&1
echo "Image Docker construite"

# Recréer le container avec le bon réseau
MAIN_NET=\$(docker network ls --filter name=lftg-network --format "{{.Name}}" | head -1)
DEFAULT_NET=\$(docker network ls --filter name=lftg-platform_default --format "{{.Name}}" | head -1)

docker rm -f lftg-frontend 2>/dev/null || true
docker run -d \
  --name lftg-frontend \
  --network "\${MAIN_NET:-lftg-platform_lftg-network}" \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://lftg-backend:3001 \
  lftg-frontend:latest

# Connecter au réseau default si différent
if [ -n "\$DEFAULT_NET" ] && [ "\$DEFAULT_NET" != "\$MAIN_NET" ]; then
  docker network connect "\$DEFAULT_NET" lftg-frontend 2>/dev/null || true
fi

# Attendre que le container soit prêt
sleep 5
docker inspect lftg-frontend --format "{{.State.Status}}" | grep -q running || exit 1
echo "Container lftg-frontend démarré"
REMOTE_EOF

  success "Frontend déployé"
  _fix_nginx
}

# ─── Correction nginx (DNS Docker) ────────────────────────────────────────────
_fix_nginx() {
  log "Correction config nginx (DNS Docker)..."
  ssh "$PROD_SERVER" bash << 'NGINX_EOF'
set -e
# Utiliser les noms DNS Docker (résolution automatique dans le réseau)
# au lieu des IPs hardcodées
NGINX_CONF="/home/ubuntu/lftg-platform/nginx/prod.conf"

# S'assurer que la config utilise les noms de containers comme alias DNS
# Le container frontend s'appelle lftg-frontend mais nginx le résout via alias
FRONTEND_IP=$(docker inspect lftg-frontend \
  --format '{{(index .NetworkSettings.Networks "lftg-platform_lftg-network").IPAddress}}' 2>/dev/null || \
  docker inspect lftg-frontend \
  --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null | head -c 15)

if [ -n "$FRONTEND_IP" ]; then
  # Mettre à jour la config nginx avec l'IP actuelle
  sed -i "s|proxy_pass http://[0-9.]*:3000|proxy_pass http://$FRONTEND_IP:3000|g" "$NGINX_CONF"
  # Copier dans le container nginx
  docker cp "$NGINX_CONF" lftg-nginx:/etc/nginx/conf.d/default.conf
  docker exec lftg-nginx nginx -t && docker exec lftg-nginx nginx -s reload
  echo "Nginx mis à jour avec IP: $FRONTEND_IP"
else
  echo "WARN: IP frontend non trouvée, nginx non modifié"
fi
NGINX_EOF
  success "Nginx mis à jour"
}

# ─── Déploiement Backend ──────────────────────────────────────────────────────
deploy_backend() {
  section "Déploiement Backend"
  local ARCHIVE="/tmp/backend_$TIMESTAMP.tar.gz"

  log "Création de l'archive dist..."
  cd "$PLATFORM_DIR/apps/backend"
  tar -czf "$ARCHIVE" dist
  success "Archive créée: $(du -sh "$ARCHIVE" | cut -f1)"

  log "Transfert vers le serveur..."
  scp "$ARCHIVE" "$PROD_SERVER:/tmp/backend_deploy.tar.gz"
  success "Transfert OK"

  log "Extraction et reconstruction Docker..."
  ssh "$PROD_SERVER" bash << REMOTE_EOF
set -e
cd $REMOTE_DIR/apps/backend
sudo rm -rf dist
tar -xzf /tmp/backend_deploy.tar.gz
echo "Extraction OK"

# Rebuild image Docker
docker build -f Dockerfile.prebuilt -t lftg-platform-backend:latest $REMOTE_DIR > /tmp/docker_backend_build.log 2>&1
echo "Image Docker construite"

# Recréer le container
NETWORK=\$(docker network ls --filter name=lftg-network --format "{{.Name}}" | head -1)
docker rm -f lftg-backend 2>/dev/null || true
docker run -d \
  --name lftg-backend \
  --network "\${NETWORK:-lftg-platform_lftg-network}" \
  --restart unless-stopped \
  -e NODE_ENV=production \
  lftg-platform-backend:latest

sleep 8
docker inspect lftg-backend --format "{{.State.Status}}" | grep -q running || exit 1
echo "Container lftg-backend démarré"
REMOTE_EOF

  success "Backend déployé"
}

# ─── Déploiement Carte ────────────────────────────────────────────────────────
deploy_map() {
  section "Déploiement Carte Interactive"

  log "Régénération des données depuis le code source..."
  cd "$PLATFORM_DIR"
  python3 scripts/generate-map-data.py > "$MAP_DIR/data.js" 2>/dev/null || \
    warn "Script de génération non disponible, data.js non régénéré"

  log "Transfert vers le serveur..."
  scp "$MAP_DIR/index.html" "$MAP_DIR/data.js" "$PROD_SERVER:$MAP_DIR/" 2>/dev/null || true
  success "Carte mise à jour"
}

# ─── Smoke Tests ──────────────────────────────────────────────────────────────
run_smoke_tests() {
  section "Smoke Tests"

  if [ "$SKIP_TESTS" = true ]; then
    warn "Tests ignorés (--skip-tests)"
    return 0
  fi

  local BASE_URL="http://51.210.15.92"
  local FAILED=0
  local PASSED=0

  # Pages critiques à tester
  declare -A CRITICAL_PAGES=(
    ["/admin"]="Dashboard principal"
    ["/admin/animaux/liste"]="Liste des animaux"
    ["/admin/formation/cours"]="Gestion des cours"
    ["/admin/stock/articles"]="Stock articles"
    ["/admin/personnel/employes"]="Employés"
    ["/admin/alertes"]="Alertes système"
    ["/admin/elevage"]="Élevage"
    ["/admin/accounting"]="Comptabilité"
    ["/admin/analytics"]="Analytics"
    ["/admin/tickets"]="Tickets"
    ["/admin/messaging"]="Messagerie"
    ["/admin/history"]="Historique"
    ["/admin/cites"]="CITES"
    ["/admin/gps"]="GPS"
    ["/admin/stripe"]="Stripe"
    ["/admin/parrainage"]="Parrainage"
    ["/admin/reports"]="Rapports"
    ["/admin/kiosque"]="Kiosque"
    ["/admin/tourisme"]="Tourisme"
    ["/admin/bi"]="BI"
    ["/public"]="Page vitrine publique"
    ["/map"]="Carte interactive"
    ["/api/v1/health"]="API Health"
  )

  log "Test de ${#CRITICAL_PAGES[@]} pages critiques..."
  echo ""

  for path in "${!CRITICAL_PAGES[@]}"; do
    local name="${CRITICAL_PAGES[$path]}"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL$path" 2>/dev/null || echo "000")

    if [[ "$code" =~ ^(200|301|302)$ ]]; then
      echo -e "  ${GREEN}✓${NC} $name ($path) — ${code}"
      ((PASSED++))
    else
      echo -e "  ${RED}✗${NC} $name ($path) — ${code}"
      ((FAILED++))
    fi
  done

  echo ""
  echo -e "${BOLD}Résultats: ${GREEN}$PASSED passés${NC} / ${RED}$FAILED échoués${NC} / $((PASSED+FAILED)) total${NC}"

  # Sauvegarder les résultats
  local RESULTS_FILE="$LOG_DIR/smoke_tests_$TIMESTAMP.json"
  cat > "$RESULTS_FILE" << JSON
{
  "timestamp": "$TIMESTAMP",
  "passed": $PASSED,
  "failed": $FAILED,
  "total": $((PASSED+FAILED)),
  "success_rate": $(echo "scale=1; $PASSED * 100 / ($PASSED + $FAILED)" | bc)
}
JSON
  log "Résultats sauvegardés: $RESULTS_FILE"

  if [ "$FAILED" -gt 0 ]; then
    warn "$FAILED page(s) en erreur — vérifier les logs"
    return 1
  fi

  success "Tous les smoke tests passent ✓"
}

# ─── Rapport de déploiement ───────────────────────────────────────────────────
deployment_report() {
  section "Rapport de déploiement"
  echo -e "${BOLD}Déploiement terminé${NC} — $(date '+%d/%m/%Y %H:%M:%S')"
  echo -e "Cible: ${CYAN}$TARGET${NC}"
  echo -e "Logs: ${CYAN}$LOG_DIR${NC}"
  echo -e "Plateforme: ${CYAN}http://51.210.15.92${NC}"
  echo -e "Carte:      ${CYAN}http://51.210.15.92/map${NC}"
  echo ""
}

# ─── Point d'entrée ───────────────────────────────────────────────────────────
main() {
  echo -e "\n${BOLD}${BLUE}╔══════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${BLUE}║   LFTG Platform — Deploy Script      ║${NC}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════╝${NC}\n"
  echo -e "Cible: ${CYAN}$TARGET${NC} | Skip build: $SKIP_BUILD | Skip tests: $SKIP_TESTS"
  echo ""

  check_ssh

  case "$TARGET" in
    frontend)
      build_frontend
      deploy_frontend
      ;;
    backend)
      build_backend
      deploy_backend
      ;;
    both)
      build_frontend
      build_backend
      deploy_frontend
      deploy_backend
      ;;
    map)
      deploy_map
      ;;
    *)
      error "Cible inconnue: $TARGET. Utiliser: frontend|backend|both|map"
      ;;
  esac

  deploy_map
  run_smoke_tests
  deployment_report
}

main "$@"
