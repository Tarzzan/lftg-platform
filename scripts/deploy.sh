#!/bin/bash
# ============================================================
# LFTG Platform — Script de déploiement avec rollback
# Appelé par GitHub Actions via SSH
# ============================================================
set -euo pipefail

REPO="ghcr.io/tarzzan/lftg-platform"
PROJECT_DIR="/home/ubuntu/lftg-platform"
NETWORK="lftg-platform_lftg-network"
LOG_FILE="/tmp/deploy_$(date +%Y%m%d_%H%M%S).log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
error() { log "ERROR: $*"; exit 1; }

# ── 1. Récupérer les nouvelles images ─────────────────────
log "=== Pulling nouvelles images Docker ==="
docker pull "${REPO}/frontend:latest" || error "Impossible de puller l'image frontend"
docker pull "${REPO}/backend:latest"  || error "Impossible de puller l'image backend"

# ── 2. Sauvegarder les images actuelles pour rollback ─────
log "=== Sauvegarde des images actuelles (rollback) ==="
CURRENT_FRONTEND=$(docker inspect lftg-frontend --format='{{.Image}}' 2>/dev/null || echo "")
CURRENT_BACKEND=$(docker inspect lftg-backend --format='{{.Image}}' 2>/dev/null || echo "")

if [ -n "$CURRENT_FRONTEND" ]; then
  docker tag "$CURRENT_FRONTEND" "${REPO}/frontend:rollback" 2>/dev/null || true
  log "Frontend rollback sauvegardé: $CURRENT_FRONTEND"
fi
if [ -n "$CURRENT_BACKEND" ]; then
  docker tag "$CURRENT_BACKEND" "${REPO}/backend:rollback" 2>/dev/null || true
  log "Backend rollback sauvegardé: $CURRENT_BACKEND"
fi

# ── 3. Récupérer les variables d'environnement du backend ─
log "=== Récupération des variables d'environnement ==="
BACKEND_ENV=$(docker inspect lftg-backend --format='{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | \
  grep -E "^(DATABASE_URL|JWT_SECRET|JWT_EXPIRES_IN|RESEND_API_KEY|NODE_ENV)=" | \
  sed 's/^/-e /' | tr '\n' ' ')

# ── 4. Redémarrer le backend ──────────────────────────────
log "=== Redémarrage du backend ==="
docker stop lftg-backend 2>/dev/null || true
docker rm lftg-backend 2>/dev/null || true
eval docker run -d \
  --name lftg-backend \
  --network "$NETWORK" \
  --restart unless-stopped \
  $BACKEND_ENV \
  "${REPO}/backend:latest" || error "Impossible de démarrer le backend"

# ── 5. Redémarrer le frontend ─────────────────────────────
log "=== Redémarrage du frontend ==="
docker stop lftg-frontend 2>/dev/null || true
docker rm lftg-frontend 2>/dev/null || true
docker run -d \
  --name lftg-frontend \
  --network "$NETWORK" \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL="http://51.210.15.92/api" \
  "${REPO}/frontend:latest" || error "Impossible de démarrer le frontend"

# ── 6. Copier les uploads dans le nouveau container ───────
log "=== Restauration des uploads ==="
if [ -d "${PROJECT_DIR}/uploads" ]; then
  docker cp "${PROJECT_DIR}/uploads/." lftg-backend:/app/uploads/ 2>/dev/null || true
  log "Uploads restaurés"
fi

# ── 7. Copier les PDFs dans le container frontend ─────────
if [ -d "${PROJECT_DIR}/docs" ]; then
  docker cp "${PROJECT_DIR}/docs/." lftg-frontend:/app/public/docs/ 2>/dev/null || true
fi

# ── 8. Health check ───────────────────────────────────────
log "=== Health check (attente 15s) ==="
sleep 15

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
log "HTTP status: $HTTP_CODE"

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "307" ] && [ "$HTTP_CODE" != "302" ]; then
  log "!!! HEALTH CHECK ÉCHOUÉ — Rollback automatique ==="

  # Rollback frontend
  docker stop lftg-frontend 2>/dev/null || true
  docker rm lftg-frontend 2>/dev/null || true
  docker run -d \
    --name lftg-frontend \
    --network "$NETWORK" \
    --restart unless-stopped \
    -e NODE_ENV=production \
    -e NEXT_PUBLIC_API_URL="http://51.210.15.92/api" \
    "${REPO}/frontend:rollback" 2>/dev/null || true

  # Rollback backend
  docker stop lftg-backend 2>/dev/null || true
  docker rm lftg-backend 2>/dev/null || true
  eval docker run -d \
    --name lftg-backend \
    --network "$NETWORK" \
    --restart unless-stopped \
    $BACKEND_ENV \
    "${REPO}/backend:rollback" 2>/dev/null || true

  error "Déploiement échoué — Rollback effectué vers la version précédente"
fi

# ── 9. Nettoyage des anciennes images ─────────────────────
log "=== Nettoyage des images inutilisées ==="
docker image prune -f --filter "until=24h" 2>/dev/null || true

log "=== DÉPLOIEMENT RÉUSSI ==="
log "Frontend: ${REPO}/frontend:latest"
log "Backend:  ${REPO}/backend:latest"
log "Log complet: $LOG_FILE"
