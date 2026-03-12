#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  LFTG Platform — Configuration de la connexion Google Drive
#  Ce script guide la connexion de votre compte Google Drive à rclone
#  pour activer les sauvegardes automatiques distantes.
# ─────────────────────────────────────────────────────────────────────────────

CONFIG_FILE="/home/ubuntu/lftg-platform/backup.conf"
REMOTE_NAME="lftg_gdrive"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     LFTG Platform — Configuration Google Drive Backup       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Étape 1 : Vérifier/installer rclone ─────────────────────────────────────
echo "[ Étape 1/4 ] Vérification de rclone..."
if command -v rclone &> /dev/null; then
  echo "✓ rclone est déjà installé ($(rclone --version | head -1))"
else
  echo "Installation de rclone..."
  curl -s https://rclone.org/install.sh | sudo bash
  if command -v rclone &> /dev/null; then
    echo "✓ rclone installé avec succès"
  else
    echo "✗ Échec de l'installation de rclone"
    exit 1
  fi
fi

echo ""

# ─── Étape 2 : Demander le chemin de destination ─────────────────────────────
echo "[ Étape 2/4 ] Chemin de destination dans Google Drive"
echo ""
echo "  Indiquez le dossier Google Drive où stocker les sauvegardes."
echo "  Exemples :"
echo "    Backups/LFTG"
echo "    Sauvegardes/Serveur Production"
echo "    Mon Drive/LFTG/Backups"
echo ""
read -p "  Chemin [défaut: Backups/LFTG] : " GDRIVE_PATH
GDRIVE_PATH="${GDRIVE_PATH:-Backups/LFTG}"
echo "  → Chemin choisi : $GDRIVE_PATH"

echo ""

# ─── Étape 3 : Configurer rclone avec Google Drive ───────────────────────────
echo "[ Étape 3/4 ] Connexion à Google Drive"
echo ""
echo "  rclone va ouvrir une fenêtre d'autorisation Google."
echo "  Si vous êtes en SSH sans interface graphique, rclone vous donnera"
echo "  une URL à copier dans votre navigateur pour autoriser l'accès."
echo ""
echo "  Appuyez sur Entrée pour lancer la configuration..."
read -p ""

rclone config create "$REMOTE_NAME" drive scope drive

# Vérifier que la configuration a réussi
if rclone listremotes 2>/dev/null | grep -q "^${REMOTE_NAME}:"; then
  echo ""
  echo "✓ Connexion Google Drive établie avec succès"
else
  echo ""
  echo "✗ La configuration n'a pas abouti."
  echo "  Vous pouvez relancer ce script ou configurer manuellement avec : rclone config"
  exit 1
fi

echo ""

# ─── Étape 4 : Activer dans backup.conf ──────────────────────────────────────
echo "[ Étape 4/4 ] Activation dans la configuration..."

if [ -f "$CONFIG_FILE" ]; then
  # Mettre à jour les valeurs existantes
  sed -i "s|^GDRIVE_ENABLED=.*|GDRIVE_ENABLED=\"true\"|" "$CONFIG_FILE"
  sed -i "s|^GDRIVE_REMOTE=.*|GDRIVE_REMOTE=\"$REMOTE_NAME\"|" "$CONFIG_FILE"
  sed -i "s|^GDRIVE_PATH=.*|GDRIVE_PATH=\"$GDRIVE_PATH\"|" "$CONFIG_FILE"
  echo "✓ Configuration mise à jour dans $CONFIG_FILE"
else
  echo "✗ Fichier $CONFIG_FILE introuvable"
  exit 1
fi

echo ""

# ─── Test de connexion ────────────────────────────────────────────────────────
echo "Test de connexion..."
if rclone lsd "${REMOTE_NAME}:" --max-depth 1 2>/dev/null; then
  echo ""
  echo "✓ Connexion Google Drive opérationnelle"
else
  echo "✗ Impossible de lister Google Drive — vérifiez les permissions"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Configuration terminée                   ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  Remote  : $REMOTE_NAME                              ║"
printf  "║  Chemin  : %-49s║\n" "$GDRIVE_PATH"
echo "║  Backup  : automatique chaque nuit à 3h                     ║"
echo "║                                                              ║"
echo "║  Pour tester manuellement :                                  ║"
echo "║  bash /home/ubuntu/lftg-platform/lftg-backup.sh             ║"
echo "║                                                              ║"
echo "║  Pour désactiver Google Drive :                              ║"
echo "║  Mettre GDRIVE_ENABLED=\"false\" dans backup.conf             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
