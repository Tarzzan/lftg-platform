#!/usr/bin/env bash
# =============================================================================
# LFTG Platform — Smoke Tests automatiques
# Usage: ./scripts/smoke-tests.sh [--base-url URL] [--output json|html|both]
# =============================================================================
set -euo pipefail

BASE_URL="${BASE_URL:-http://51.210.15.92}"
OUTPUT_FORMAT="both"
LOG_DIR="/tmp/lftg-deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

for i in "$@"; do
  case $i in
    --base-url=*) BASE_URL="${i#*=}" ;;
    --output=*)   OUTPUT_FORMAT="${i#*=}" ;;
  esac
done

mkdir -p "$LOG_DIR"

# ─── Couleurs ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ─── Définition des tests ─────────────────────────────────────────────────────
# Format: "route|nom|criticité(critical/high/medium/low)|type(page/api)"
declare -a TESTS=(
  # ── Pages critiques ──────────────────────────────────────────────────────
  "/admin|Dashboard principal|critical|page"
  "/login|Page de connexion|critical|page"
  "/public|Page vitrine publique|critical|page"
  "/map|Carte interactive|high|page"

  # ── Animaux ──────────────────────────────────────────────────────────────
  "/admin/animaux/liste|Liste des animaux|critical|page"
  "/admin/animaux/especes|Espèces|high|page"
  "/admin/elevage|Élevage & Généalogie|high|page"
  "/admin/cites|CITES|high|page"
  "/admin/gps|GPS Tracking|medium|page"

  # ── Formation ────────────────────────────────────────────────────────────
  "/admin/formation/cours|Gestion des cours|critical|page"
  "/admin/formation/cohortes|Cohortes|high|page"

  # ── Personnel ────────────────────────────────────────────────────────────
  "/admin/personnel/employes|Employés|high|page"
  "/admin/personnel/planning|Planning|high|page"

  # ── Stock ─────────────────────────────────────────────────────────────────
  "/admin/stock/articles|Articles stock|high|page"
  "/admin/stock/mouvements|Mouvements stock|high|page"
  "/admin/stock/demandes|Demandes stock|medium|page"

  # ── Ventes & Commerce ────────────────────────────────────────────────────
  "/admin/stripe|Stripe Paiements|high|page"
  "/admin/accounting|Comptabilité FEC|high|page"
  "/admin/parrainage|Parrainage|medium|page"

  # ── Système ───────────────────────────────────────────────────────────────
  "/admin/alertes|Alertes système|critical|page"
  "/admin/history|Historique|high|page"
  "/admin/tickets|Tickets|high|page"
  "/admin/messaging|Messagerie|high|page"

  # ── Analytics ────────────────────────────────────────────────────────────
  "/admin/analytics|Analytics|medium|page"
  "/admin/bi|Business Intelligence|medium|page"
  "/admin/reports|Rapports|medium|page"

  # ── Expérience ───────────────────────────────────────────────────────────
  "/admin/kiosque|Kiosque|low|page"
  "/admin/tourisme|Tourisme|low|page"

  # ── APIs Backend ──────────────────────────────────────────────────────────
  "/health|API Health Check|critical|api"
  "/api/v1/plugins/animaux/animals|API Animaux|high|api"
  "/api/v1/plugins/formation/courses|API Formations|critical|api"
  "/api/v1/plugins/animaux/stats|API Stats Animaux|high|api"
  "/api/v1/plugins/formation/stats|API Stats Formation|high|api"
  "/api/v1/alertes/stats|API Alertes Stats|high|api"
  "/api/v1/auth/login|API Auth Login|critical|api"
  "/docs|Swagger API Docs|medium|api"
)

# ─── Exécuter les tests ───────────────────────────────────────────────────────
RESULTS=()
PASSED=0; FAILED=0; WARNED=0
declare -A CRIT_COUNTS=([critical]=0 [high]=0 [medium]=0 [low]=0)
declare -A CRIT_FAILED=([critical]=0 [high]=0 [medium]=0 [low]=0)

echo -e "\n${BOLD}${CYAN}LFTG Platform — Smoke Tests${NC}"
echo -e "Base URL: ${CYAN}$BASE_URL${NC}"
echo -e "$(date '+%d/%m/%Y %H:%M:%S')\n"
echo -e "${BOLD}$(printf '%-45s %-25s %-10s %-8s' 'Route' 'Nom' 'Criticité' 'Status')${NC}"
echo "$(printf '%0.s─' {1..90})"

for test in "${TESTS[@]}"; do
  IFS='|' read -r route name criticite type <<< "$test"

  # Exécuter le test
  START=$(date +%s%N)
  # Utiliser POST pour les routes auth/login
  if [[ "$route" == *"auth/login"* ]]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 15 --connect-timeout 5 \
      -X POST -H "Content-Type: application/json" \
      -d '{"email":"smoke@test.com","password":"test"}' \
      "$BASE_URL$route" 2>/dev/null || echo "000")
  else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 15 \
      --connect-timeout 5 \
      -L \
      "$BASE_URL$route" 2>/dev/null || echo "000")
  fi
  END=$(date +%s%N)
  DURATION=$(( (END - START) / 1000000 ))

  # Évaluer le résultat
  if [[ "$HTTP_CODE" =~ ^(200|301|302)$ ]]; then
    STATUS="PASS"
    STATUS_COLOR="$GREEN"
    PASSED=$((PASSED+1))
  elif [[ "$HTTP_CODE" =~ ^(401|403)$ ]]; then
    STATUS="AUTH"  # Normal pour les pages admin sans token
    STATUS_COLOR="$YELLOW"
    WARNED=$((WARNED+1))
  else
    STATUS="FAIL"
    STATUS_COLOR="$RED"
    FAILED=$((FAILED+1))
    CRIT_FAILED[$criticite]=$(( ${CRIT_FAILED[$criticite]:-0} + 1 ))
  fi

  CRIT_COUNTS[$criticite]=$(( ${CRIT_COUNTS[$criticite]:-0} + 1 ))

  # Afficher le résultat
  printf "${STATUS_COLOR}%-45s %-25s %-10s %-8s${NC} %s %dms\n" \
    "$route" "$name" "$criticite" "$STATUS" "$HTTP_CODE" "$DURATION"

  # Stocker pour le rapport
  RESULTS+=("{\"route\":\"$route\",\"name\":\"$name\",\"criticite\":\"$criticite\",\"type\":\"$type\",\"status\":\"$STATUS\",\"httpCode\":\"$HTTP_CODE\",\"duration\":$DURATION}")
done

echo "$(printf '%0.s─' {1..90})"

# ─── Résumé ───────────────────────────────────────────────────────────────────
TOTAL=$((PASSED + FAILED + WARNED))
SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc 2>/dev/null || echo "0")

echo ""
echo -e "${BOLD}Résumé:${NC}"
echo -e "  ${GREEN}✓ Passés:${NC}    $PASSED"
echo -e "  ${YELLOW}⚠ Auth requis:${NC} $WARNED"
echo -e "  ${RED}✗ Échoués:${NC}   $FAILED"
echo -e "  ${BOLD}Taux de succès: ${SUCCESS_RATE}%${NC}"
echo ""

# Détail par criticité
echo -e "${BOLD}Par criticité:${NC}"
for crit in critical high medium low; do
  total=${CRIT_COUNTS[$crit]}
  failed=${CRIT_FAILED[$crit]}
  passed=$((total - failed))
  if [ "$total" -gt 0 ]; then
    if [ "$failed" -gt 0 ]; then
      echo -e "  ${RED}$crit: $failed/$total échoués${NC}"
    else
      echo -e "  ${GREEN}$crit: $passed/$total OK${NC}"
    fi
  fi
done

# ─── Rapport JSON ─────────────────────────────────────────────────────────────
if [[ "$OUTPUT_FORMAT" =~ (json|both) ]]; then
  JSON_FILE="$LOG_DIR/smoke_tests_$TIMESTAMP.json"
  RESULTS_JSON=$(IFS=','; echo "[${RESULTS[*]}]")
  cat > "$JSON_FILE" << JSON
{
  "timestamp": "$(date -Iseconds)",
  "baseUrl": "$BASE_URL",
  "summary": {
    "total": $TOTAL,
    "passed": $PASSED,
    "failed": $FAILED,
    "warned": $WARNED,
    "successRate": $SUCCESS_RATE
  },
  "criticalFailed": ${CRIT_FAILED[critical]},
  "highFailed": ${CRIT_FAILED[high]},
  "results": $RESULTS_JSON
}
JSON
  echo ""
  echo -e "Rapport JSON: ${CYAN}$JSON_FILE${NC}"
fi

# ─── Rapport HTML ─────────────────────────────────────────────────────────────
if [[ "$OUTPUT_FORMAT" =~ (html|both) ]]; then
  HTML_FILE="$LOG_DIR/smoke_tests_$TIMESTAMP.html"
  RESULTS_JSON=$(IFS=','; echo "[${RESULTS[*]}]")

  cat > "$HTML_FILE" << HTML
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>LFTG Smoke Tests — $(date '+%d/%m/%Y %H:%M')</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
  h1 { color: #1e293b; font-size: 1.5rem; }
  .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 24px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat { background: white; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
  .stat .value { font-size: 2rem; font-weight: 700; }
  .stat .label { font-size: 0.75rem; color: #64748b; margin-top: 4px; }
  .pass { color: #16a34a; } .fail { color: #dc2626; } .warn { color: #d97706; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 600; color: #475569; text-transform: uppercase; }
  td { padding: 10px 16px; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; }
  .badge { display: inline-flex; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
  .badge-pass { background: #dcfce7; color: #16a34a; }
  .badge-fail { background: #fee2e2; color: #dc2626; }
  .badge-auth { background: #fef9c3; color: #d97706; }
  .badge-critical { background: #fee2e2; color: #dc2626; }
  .badge-high { background: #ffedd5; color: #ea580c; }
  .badge-medium { background: #fef9c3; color: #d97706; }
  .badge-low { background: #f0fdf4; color: #16a34a; }
</style>
</head>
<body>
<h1>🧪 LFTG Platform — Smoke Tests</h1>
<div class="meta">Généré le $(date '+%d/%m/%Y à %H:%M:%S') · Base URL: $BASE_URL</div>
<div class="stats">
  <div class="stat"><div class="value pass">$PASSED</div><div class="label">Passés</div></div>
  <div class="stat"><div class="value fail">$FAILED</div><div class="label">Échoués</div></div>
  <div class="stat"><div class="value warn">$WARNED</div><div class="label">Auth requis</div></div>
  <div class="stat"><div class="value">${SUCCESS_RATE}%</div><div class="label">Taux de succès</div></div>
</div>
<table>
  <thead><tr><th>Route</th><th>Nom</th><th>Criticité</th><th>Type</th><th>Status</th><th>HTTP</th><th>Durée</th></tr></thead>
  <tbody id="results"></tbody>
</table>
<script>
const data = $RESULTS_JSON;
const tbody = document.getElementById('results');
data.forEach(r => {
  const statusClass = r.status === 'PASS' ? 'pass' : r.status === 'AUTH' ? 'auth' : 'fail';
  tbody.innerHTML += \`<tr>
    <td><code>\${r.route}</code></td>
    <td>\${r.name}</td>
    <td><span class="badge badge-\${r.criticite}">\${r.criticite}</span></td>
    <td>\${r.type}</td>
    <td><span class="badge badge-\${statusClass.toLowerCase()}">\${r.status}</span></td>
    <td>\${r.httpCode}</td>
    <td>\${r.duration}ms</td>
  </tr>\`;
});
</script>
</body>
</html>
HTML
  echo -e "Rapport HTML: ${CYAN}$HTML_FILE${NC}"
fi

# ─── Code de sortie ───────────────────────────────────────────────────────────
if [ "${CRIT_FAILED[critical]}" -gt 0 ]; then
  echo -e "\n${RED}${BOLD}ERREUR CRITIQUE: ${CRIT_FAILED[critical]} test(s) critiques échoués !${NC}"
  exit 2
elif [ "$FAILED" -gt 0 ]; then
  echo -e "\n${YELLOW}${BOLD}AVERTISSEMENT: $FAILED test(s) non critiques échoués${NC}"
  exit 1
else
  echo -e "\n${GREEN}${BOLD}✓ Tous les tests passent${NC}"
  exit 0
fi
