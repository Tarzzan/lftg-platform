#!/bin/bash

# LFTG Platform — Script de sauvegarde de la base de données PostgreSQL
# Phase 12 — Backup automatique

set -euo pipefail

# Variables
DB_USER="${DB_USER:-ubuntu}"
DB_NAME="${DB_NAME:-lftg_platform}"
BACKUP_DIR="/home/ubuntu/lftg-platform/backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"

# Créer le répertoire de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Exécuter la sauvegarde avec pg_dump
# Le mot de passe est géré via le fichier ~/.pgpass ou la variable PGPASSWORD
echo "Début de la sauvegarde de la base de données '$DB_NAME'..."
pg_dump -U "$DB_USER" -d "$DB_NAME" -h localhost --format=c --blobs | gzip > "$BACKUP_FILE"

# Vérifier que le fichier de backup a été créé
if [ -f "$BACKUP_FILE" ]; then
  echo "Sauvegarde réussie : $BACKUP_FILE"
  
  # Supprimer les backups de plus de 30 jours
  echo "Nettoyage des anciens backups..."
  find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
  echo "Nettoyage terminé."
else
  echo "ERREUR : La sauvegarde a échoué." >&2
  exit 1
fi

exit 0
