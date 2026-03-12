#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  LFTG Platform — Sauvegarde automatique quotidienne
#  - Dump PostgreSQL compressé
#  - Sauvegarde des uploads (fichiers cours, images)
#  - Rotation locale sur 7 jours
#  - Synchronisation optionnelle vers Google Drive (via rclone)
#
#  CONFIGURATION GOOGLE DRIVE :
#  Modifier le fichier /home/ubuntu/lftg-platform/backup.conf
#  pour activer et configurer la synchronisation Google Drive.
# ─────────────────────────────────────────────────────────────────────────────

BACKUP_DIR="/home/ubuntu/lftg-backups"
PLATFORM_DIR="/home/ubuntu/lftg-platform"
CONFIG_FILE="/home/ubuntu/lftg-platform/backup.conf"
DATE=$(date '+%Y-%m-%d_%H-%M')
LOG_FILE="/home/ubuntu/lftg-platform/logs/backup.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/uploads" "$(dirname "$LOG_FILE")"

# ─── Charger la configuration ─────────────────────────────────────────────────
GDRIVE_ENABLED="false"
GDRIVE_REMOTE="lftg_gdrive"
GDRIVE_PATH="Backups/LFTG"

if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
fi

log "=== Backup LFTG démarré ($DATE) ==="
log "Google Drive: $GDRIVE_ENABLED | Chemin: $GDRIVE_REMOTE:$GDRIVE_PATH"

# ─── 1. Backup PostgreSQL ─────────────────────────────────────────────────────
log "Dump PostgreSQL..."
docker exec lftg-postgres-prod pg_dump -U lftg -d lftg_platform --no-owner --no-acl \
  | gzip > "$BACKUP_DIR/db/lftg_db_${DATE}.sql.gz"

if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$BACKUP_DIR/db/lftg_db_${DATE}.sql.gz" | cut -f1)
  log "✓ DB sauvegardée: lftg_db_${DATE}.sql.gz ($SIZE)"
else
  log "✗ Erreur lors du dump PostgreSQL"
fi

# ─── 2. Backup uploads ───────────────────────────────────────────────────────
log "Sauvegarde uploads..."
tar -czf "$BACKUP_DIR/uploads/lftg_uploads_${DATE}.tar.gz" \
  -C "$PLATFORM_DIR" uploads/ 2>/dev/null

if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$BACKUP_DIR/uploads/lftg_uploads_${DATE}.tar.gz" | cut -f1)
  log "✓ Uploads sauvegardés: lftg_uploads_${DATE}.tar.gz ($SIZE)"
else
  log "✗ Erreur lors de la sauvegarde uploads"
fi

# ─── 3. Rotation locale — garder 7 jours ─────────────────────────────────────
log "Rotation des backups locaux (conservation 7 jours)..."
find "$BACKUP_DIR/db" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR/uploads" -name "*.tar.gz" -mtime +7 -delete
log "✓ Rotation locale terminée"

# ─── 4. Synchronisation Google Drive (optionnelle) ───────────────────────────
if [ "$GDRIVE_ENABLED" = "true" ]; then
  log "Synchronisation vers Google Drive ($GDRIVE_REMOTE:$GDRIVE_PATH)..."

  # Vérifier que rclone est installé
  if ! command -v rclone &> /dev/null; then
    log "✗ rclone non installé — exécuter: curl https://rclone.org/install.sh | sudo bash"
  else
    # Vérifier que le remote est configuré
    if rclone listremotes 2>/dev/null | grep -q "^${GDRIVE_REMOTE}:"; then
      # Copier le dernier dump DB
      rclone copy "$BACKUP_DIR/db/lftg_db_${DATE}.sql.gz" \
        "${GDRIVE_REMOTE}:${GDRIVE_PATH}/db/" \
        --config /home/ubuntu/.config/rclone/rclone.conf 2>&1 | tee -a "$LOG_FILE"

      # Copier la dernière archive uploads
      rclone copy "$BACKUP_DIR/uploads/lftg_uploads_${DATE}.tar.gz" \
        "${GDRIVE_REMOTE}:${GDRIVE_PATH}/uploads/" \
        --config /home/ubuntu/.config/rclone/rclone.conf 2>&1 | tee -a "$LOG_FILE"

      log "✓ Synchronisation Google Drive terminée"
    else
      log "✗ Remote '$GDRIVE_REMOTE' non configuré — exécuter: /home/ubuntu/lftg-platform/lftg-gdrive-setup.sh"
    fi
  fi
else
  log "ℹ Google Drive désactivé (modifier $CONFIG_FILE pour activer)"
fi

# ─── 5. Rapport final ────────────────────────────────────────────────────────
DB_COUNT=$(ls "$BACKUP_DIR/db/" 2>/dev/null | wc -l)
UPL_COUNT=$(ls "$BACKUP_DIR/uploads/" 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

log "=== Backup terminé: $DB_COUNT dumps DB, $UPL_COUNT archives uploads, total $TOTAL_SIZE ==="
