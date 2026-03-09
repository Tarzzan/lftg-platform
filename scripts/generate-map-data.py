#!/usr/bin/env python3
"""
LFTG Platform — Générateur automatique de données pour la carte interactive
Analyse le code source et produit data.js avec l'état réel du projet
"""
import os, re, json, ast
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
FRONTEND_SRC = ROOT / "apps/frontend/src"
BACKEND_SRC  = ROOT / "apps/backend/src"
PLUGINS_SRC  = ROOT / "plugins"
PACKAGES_SRC = ROOT / "packages"

# ─── Analyse d'une page frontend ─────────────────────────────────────────────
def analyze_page(path: Path) -> dict:
    try:
        content = path.read_text(encoding='utf-8', errors='ignore')
    except:
        return {}

    lines = len(content.splitlines())

    # Détecter les imports API réels (deux patterns : import { ...Api } et import { api })
    api_imports = re.findall(r"import\s*\{([^}]+)\}\s*from\s*['\"]@/lib/api['\"]" , content)
    api_calls = []
    for imp in api_imports:
        api_calls.extend([x.strip() for x in imp.split(',') if 'Api' in x or x.strip() == 'api'])
    # Si import { api } est présent, c'est suffisant
    if not api_calls and re.search(r"import\s*\{[^}]*\bapi\b[^}]*\}\s*from\s*['\"]@/lib/api['\"]" , content):
        api_calls = ['api']

    # Détecter useQuery / useMutation (react-query) comme indicateur fort de connexion API
    has_usequery = bool(re.search(r'useQuery|useMutation|useInfiniteQuery', content))
    if has_usequery:
        api_calls = api_calls or ['api']  # Considérer comme connecté si useQuery présent

    # Détecter react-hook-form (useForm) comme indicateur de formulaire connecté
    has_useform = bool(re.search(r'useForm|useController|useFieldArray', content))

    # Détecter les données statiques / mock
    has_mock = bool(re.search(r'(isDemoMode|demoData|DEMO_DATA|mockData|hardcoded|placeholder)', content, re.I))
    has_useeffect = 'useEffect' in content or has_usequery or 'useRef' in content
    # Détecter les appels API : fetch, axios, api.get, apiObj.method(), .then(, .catch(
    has_fetch = bool(re.search(r'(fetch|axios|api\.get|api\.post|api\.put|api\.delete|\.get\(|\.post\(|\.patch\(|\.delete\()', content))
    # Détecter aussi les appels sur des objets API nommés (ex: dashboardApi.stats(), enclosApi.get())
    has_named_api_call = bool(re.search(r'[a-zA-Z]+Api\.[a-zA-Z]+\(', content))
    if has_named_api_call:
        has_fetch = True  # Considérer comme fetch si appel sur un objet API nommé
    # Détecter les imports dynamiques (ex: import('swagger-ui-react'))
    has_dynamic_import = bool(re.search(r'import\s*\(', content))
    if has_dynamic_import and has_useeffect:
        has_fetch = True  # Import dynamique dans useEffect = page connectée
    # Détecter fetch natif avec variable API locale (ex: const API = process.env... ou const apiUrl = ...)
    has_env_api = bool(re.search(r"const\s+(API|apiUrl|BASE_URL|API_URL)\s*=\s*(process\.env|['\"`])", content))
    if has_env_api and bool(re.search(r'fetch\s*\(', content)):
        api_calls = api_calls or ['api']  # Fetch natif avec variable API = page connectée
        has_fetch = True
    has_loading = bool(re.search(r'(loading|isLoading|setLoading|isFetching|disabled)', content))
    has_error = bool(re.search(r'(isError|error\.message|setError|catch\s*\(|onError|errors\.)', content))
    has_form = bool(re.search(r'(onSubmit|handleSubmit|<form|<Form|useForm)', content, re.I))
    has_table = bool(re.search(r'(<table|<Table|\.map\(.*=>\s*<tr)', content, re.I))
    has_search = bool(re.search(r'(search|filter|Search|Filter)', content))
    # Pages sans useEffect mais avec appels API déclenchés par événements (boutons)
    has_event_driven_api = api_calls and has_fetch and has_loading and not has_useeffect

    # Cas spéciaux : pages fonctionnelles par nature
    is_redirect_page = bool(re.search(r'^import.*redirect.*next.*navigation', content, re.M)) and lines < 10
    is_pwa_offline = bool(re.search(r'(hors ligne|offline|connexion internet)', content, re.I)) and lines < 50

    # Déterminer le statut réel
    if is_redirect_page or is_pwa_offline:
        status = 'done'           # Pages système fonctionnelles par nature
    elif api_calls and has_useeffect and (has_fetch or has_usequery) and has_loading:
        if has_error or has_useform:
            status = 'done'       # Connecté avec gestion d'erreur ou formulaire validé = terminé
        else:
            status = 'connected'  # Connecté mais sans gestion d'erreur
    elif has_event_driven_api and has_error:
        status = 'done'           # Page action (boutons) connectée avec gestion d'erreur
    elif has_event_driven_api:
        status = 'connected'      # Page action connectée sans gestion d'erreur
    elif has_useeffect and (has_fetch or has_usequery):
        status = 'connected'      # Connexion partielle
    elif has_useform and has_fetch and has_error:
        status = 'done'           # Formulaire connecté avec gestion d'erreur
    elif has_mock and not has_fetch and not has_usequery:
        status = 'stub'           # Données statiques uniquement
    elif lines < 80:
        status = 'stub'           # Page trop courte = stub
    else:
        status = 'partial'        # En cours

    # Calculer un score de complétude (0-100)
    score = 0
    if is_redirect_page or is_pwa_offline: score = 100
    else:
        if api_calls:           score += 30
        if has_useeffect:       score += 10
        if has_fetch:           score += 15
        if has_loading:         score += 10
        if has_error:           score += 10
        if has_form:            score += 10
        if has_useform:         score += 5
        if has_table:           score += 5
        if has_search:          score += 5
        if lines > 200:         score += 5
        if has_dynamic_import:  score += 5
        score = min(score, 100)

    return {
        'lines': lines,
        'apiCalls': api_calls,
        'hasMock': has_mock,
        'hasForm': has_form,
        'hasTable': has_table,
        'hasSearch': has_search,
        'status': status,
        'score': score,
    }

# ─── Analyser toutes les pages frontend ──────────────────────────────────────
def scan_frontend_pages() -> list:
    pages = []
    pages_dir = FRONTEND_SRC / "app"
    if not pages_dir.exists():
        return pages

    for page_file in sorted(pages_dir.rglob("page.tsx")):
        rel = page_file.parent.relative_to(pages_dir)
        route = "/" + str(rel).replace("\\", "/")
        if route == "/.":
            route = "/"

        # Ignorer les routes dynamiques pures
        if route.count("[") > 1:
            continue

        analysis = analyze_page(page_file)
        if not analysis:
            continue

        # Déterminer le domaine
        parts = route.strip("/").split("/")
        domain = parts[1] if len(parts) > 1 else parts[0] if parts else "core"
        domain_map = {
            "animaux": "Animaux", "elevage": "Animaux", "cites": "Animaux",
            "gbif": "Animaux", "gps": "Animaux", "enclos": "Animaux",
            "formation": "Formation", "cours": "Formation",
            "personnel": "Personnel", "planning": "Personnel",
            "stock": "Stock", "ventes": "Ventes", "stripe": "Ventes",
            "accounting": "Ventes", "parrainage": "Ventes",
            "medical": "Médical", "nutrition": "Médical",
            "analytics": "Analytics", "bi": "Analytics", "reports": "Analytics",
            "alertes": "Système", "history": "Système", "tickets": "Système",
            "messaging": "Système", "notifications": "Système",
            "kiosque": "Expérience", "tourisme": "Expérience",
            "public": "Vitrine", "map": "Infrastructure",
            "admin": "Core", "login": "Core",
        }
        domain_name = domain_map.get(domain, "Core")

        # Priorité métier
        priority_map = {
            "Animaux": 1, "Médical": 1, "Système": 2, "Formation": 2,
            "Personnel": 3, "Stock": 3, "Ventes": 3, "Analytics": 4,
            "Expérience": 4, "Vitrine": 2, "Core": 1, "Infrastructure": 5
        }

        pages.append({
            "id": route.replace("/", "_").strip("_") or "home",
            "route": route,
            "domain": domain_name,
            "priority": priority_map.get(domain_name, 5),
            "status": analysis["status"],
            "score": analysis["score"],
            "lines": analysis["lines"],
            "apiCalls": analysis["apiCalls"],
            "hasMock": analysis["hasMock"],
            "hasForm": analysis["hasForm"],
            "hasTable": analysis["hasTable"],
            "hasSearch": analysis["hasSearch"],
        })

    return pages

# ─── Analyser les modules backend ─────────────────────────────────────────────
def scan_backend_modules() -> list:
    modules = []

    def analyze_controller(ctrl_path: Path, module_name: str, domain: str) -> dict:
        try:
            content = ctrl_path.read_text(encoding='utf-8', errors='ignore')
        except:
            return {}

        endpoints = []
        for line in content.splitlines():
            m = re.search(r"@(Get|Post|Patch|Put|Delete)\(['\"]?([^'\")\s]*)['\"]?\)", line)
            if m:
                method = m.group(1).upper()
                path   = m.group(2) or ""
                endpoints.append({"method": method, "path": path})

        lines = len(content.splitlines())
        has_service = bool(re.search(r'(service\.|Service)', content))
        has_guard   = bool(re.search(r'(Guard|@UseGuards|JwtAuth)', content))
        has_dto     = bool(re.search(r'(Dto|@Body|@Param)', content))
        has_swagger = bool(re.search(r'(@ApiTags|@ApiOperation|@ApiResponse)', content))

        score = 0
        if endpoints:          score += 20
        if len(endpoints) > 3: score += 15
        if has_service:        score += 20
        if has_guard:          score += 15
        if has_dto:            score += 15
        if has_swagger:        score += 10
        if lines > 100:        score += 5
        score = min(score, 100)

        if score >= 80:   status = 'done'
        elif score >= 50: status = 'partial'
        elif score >= 20: status = 'basic'
        else:             status = 'stub'

        return {
            "name": module_name,
            "domain": domain,
            "endpoints": endpoints,
            "endpointCount": len(endpoints),
            "lines": lines,
            "hasGuard": has_guard,
            "hasDto": has_dto,
            "hasSwagger": has_swagger,
            "status": status,
            "score": score,
        }

    domain_map = {
        "auth": "Système", "users": "Système", "roles": "Système",
        "audit": "Système", "history": "Système", "tickets": "Système",
        "messaging": "Système", "notifications": "Système", "websocket": "Système",
        "alertes": "Système", "workflows": "Système",
        "animaux-couvees": "Animaux", "cites": "Animaux", "gbif": "Animaux",
        "gps": "Animaux", "enclos": "Animaux", "elevage": "Animaux",
        "genealogy": "Animaux", "nutrition": "Médical", "medical": "Médical",
        "formation": "Formation", "contact": "Vitrine",
        "personnel": "Personnel", "stock": "Stock",
        "ventes": "Ventes", "stripe": "Ventes", "accounting": "Ventes",
        "parrainage": "Ventes", "partners": "Ventes",
        "analytics": "Analytics", "bi": "Analytics", "reports": "Analytics",
        "ml": "Analytics", "previsions": "Analytics",
        "kiosque": "Expérience", "tourisme": "Expérience", "sites": "Expérience",
        "fcm": "Infrastructure", "push": "Infrastructure", "iot": "Infrastructure",
        "export": "Infrastructure", "import": "Infrastructure",
    }

    # Scanner les modules backend core
    for ctrl in sorted((BACKEND_SRC / "modules").rglob("*.controller.ts")):
        module_name = ctrl.parent.name
        domain = domain_map.get(module_name, "Core")
        info = analyze_controller(ctrl, module_name, domain)
        if info:
            modules.append(info)

    # Scanner les plugins
    for plugin_dir in sorted(PLUGINS_SRC.iterdir()):
        if not plugin_dir.is_dir():
            continue
        for ctrl in sorted(plugin_dir.rglob("*.controller.ts")):
            module_name = plugin_dir.name
            domain = domain_map.get(module_name, "Plugin")
            info = analyze_controller(ctrl, module_name, domain)
            if info:
                modules.append(info)

    return modules

# ─── Analyser les modèles Prisma ──────────────────────────────────────────────
def scan_prisma_models() -> list:
    schema_path = PACKAGES_SRC / "core/prisma/schema.prisma"
    if not schema_path.exists():
        return []

    content = schema_path.read_text(encoding='utf-8', errors='ignore')
    models = []

    for m in re.finditer(r'model\s+(\w+)\s*\{([^}]+)\}', content, re.DOTALL):
        name = m.group(1)
        body = m.group(2)
        fields = [f.strip().split()[0] for f in body.strip().splitlines()
                  if f.strip() and not f.strip().startswith("//") and not f.strip().startswith("@")]
        fields = [f for f in fields if f and not f.startswith("@@")]
        models.append({"name": name, "fieldCount": len(fields), "fields": fields[:8]})

    return models

# ─── Calculer les statistiques globales ──────────────────────────────────────
def compute_stats(pages, modules, models) -> dict:
    def count_status(items, status):
        return len([i for i in items if i.get('status') == status])

    page_done      = count_status(pages, 'done')
    page_connected = count_status(pages, 'connected')
    page_partial   = count_status(pages, 'partial')
    page_stub      = count_status(pages, 'stub')

    mod_done    = count_status(modules, 'done')
    mod_partial = count_status(modules, 'partial')
    mod_basic   = count_status(modules, 'basic')
    mod_stub    = count_status(modules, 'stub')

    total_endpoints = sum(m.get('endpointCount', 0) for m in modules)

    # Score global pondéré
    page_score = (page_done * 100 + page_connected * 70 + page_partial * 40 + page_stub * 10) / max(len(pages), 1)
    mod_score  = (mod_done * 100 + mod_partial * 60 + mod_basic * 30 + mod_stub * 10) / max(len(modules), 1)
    global_score = round((page_score * 0.6 + mod_score * 0.4), 1)

    # Domaines
    domains = {}
    for p in pages:
        d = p.get('domain', 'Core')
        if d not in domains:
            domains[d] = {'pages': 0, 'done': 0, 'connected': 0, 'partial': 0, 'stub': 0}
        domains[d]['pages'] += 1
        domains[d][p.get('status', 'stub')] = domains[d].get(p.get('status', 'stub'), 0) + 1

    domain_list = []
    for name, data in sorted(domains.items()):
        total = data['pages']
        done  = data.get('done', 0) + data.get('connected', 0)
        pct   = round(done * 100 / max(total, 1))
        domain_list.append({
            "name": name, "total": total, "done": done,
            "partial": data.get('partial', 0), "stub": data.get('stub', 0),
            "percent": pct
        })

    return {
        "generatedAt": datetime.now().isoformat(),
        "globalScore": global_score,
        "pages": {
            "total": len(pages), "done": page_done, "connected": page_connected,
            "partial": page_partial, "stub": page_stub
        },
        "modules": {
            "total": len(modules), "done": mod_done, "partial": mod_partial,
            "basic": mod_basic, "stub": mod_stub
        },
        "models": {"total": len(models)},
        "endpoints": {"total": total_endpoints},
        "domains": domain_list,
    }

# ─── Générer la roadmap priorisée ─────────────────────────────────────────────
def generate_roadmap(pages, modules) -> list:
    tasks = []

    # Pages à connecter (non terminées)
    for p in pages:
        if p.get('status') in ('stub', 'partial'):
            tasks.append({
                "id": f"page_{p['id']}",
                "type": "frontend",
                "title": f"Connecter {p['route']}",
                "domain": p.get('domain', 'Core'),
                "priority": p.get('priority', 5),
                "status": "todo",
                "effort": "M" if p.get('lines', 0) > 100 else "S",
                "route": p.get('route'),
                "currentScore": p.get('score', 0),
            })
        elif p.get('status') == 'connected':
            tasks.append({
                "id": f"page_{p['id']}",
                "type": "frontend",
                "title": f"Valider {p['route']}",
                "domain": p.get('domain', 'Core'),
                "priority": p.get('priority', 5),
                "status": "in_progress",
                "effort": "S",
                "route": p.get('route'),
                "currentScore": p.get('score', 0),
            })

    # Modules backend à compléter
    for m in modules:
        if m.get('status') in ('stub', 'basic'):
            tasks.append({
                "id": f"module_{m['name']}",
                "type": "backend",
                "title": f"Compléter module {m['name']}",
                "domain": m.get('domain', 'Core'),
                "priority": 3,
                "status": "todo",
                "effort": "L",
                "endpointCount": m.get('endpointCount', 0),
                "currentScore": m.get('score', 0),
            })

    # Trier par priorité puis par score décroissant
    tasks.sort(key=lambda t: (t['priority'], -t.get('currentScore', 0)))
    return tasks

# ─── Point d'entrée ───────────────────────────────────────────────────────────
def main():
    pages   = scan_frontend_pages()
    modules = scan_backend_modules()
    models  = scan_prisma_models()
    stats   = compute_stats(pages, modules, models)
    roadmap = generate_roadmap(pages, modules)

    # Sprints historiques (à maintenir manuellement)
    sprints = [
        {"id": "sprint1", "name": "Sprint 1 — Core Système", "status": "done", "completedAt": "2026-03-07",
         "tasks": [
             {"name": "Historique", "status": "done", "page": "/admin/history"},
             {"name": "Tickets", "status": "done", "page": "/admin/tickets"},
             {"name": "Messagerie", "status": "done", "page": "/admin/messaging"},
         ]},
        {"id": "sprint2", "name": "Sprint 2 — Animaux & Terrain", "status": "done", "completedAt": "2026-03-07",
         "tasks": [
             {"name": "CITES", "status": "done", "page": "/admin/cites"},
             {"name": "GPS", "status": "done", "page": "/admin/gps"},
         ]},
        {"id": "sprint3", "name": "Sprint 3 — Ventes & Commerce", "status": "done", "completedAt": "2026-03-07",
         "tasks": [
             {"name": "Stripe", "status": "done", "page": "/admin/stripe"},
             {"name": "Comptabilité FEC", "status": "done", "page": "/admin/accounting"},
             {"name": "Parrainage", "status": "done", "page": "/admin/parrainage"},
         ]},
        {"id": "sprint4", "name": "Sprint 4 — Analytics & Expérience", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Reports", "status": "done", "page": "/admin/reports"},
             {"name": "Kiosque", "status": "done", "page": "/admin/kiosque"},
             {"name": "Tourisme", "status": "done", "page": "/admin/tourisme"},
             {"name": "BI", "status": "done", "page": "/admin/bi"},
         ]},
        {"id": "sprint5", "name": "Sprint 5 — Personnel, Stock & Surveillance", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Alertes système", "status": "done", "page": "/admin/alertes"},
             {"name": "Élevage & Généalogie", "status": "done", "page": "/admin/elevage"},
             {"name": "Stock — Mouvements", "status": "done", "page": "/admin/stock/mouvements"},
             {"name": "Stock — Demandes", "status": "done", "page": "/admin/stock/demandes"},
             {"name": "Planning Personnel", "status": "done", "page": "/admin/personnel/planning"},
         ]},
        {"id": "sprint6", "name": "Sprint 6 — Médical, Agenda & Nutrition", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Agenda mensuel", "status": "done", "page": "/admin/agenda"},
             {"name": "Agenda semaine", "status": "done", "page": "/admin/agenda/semaine"},
             {"name": "Nutrition", "status": "done", "page": "/admin/nutrition"},
             {"name": "Médical — bug fix", "status": "done", "page": "/admin/medical"},
         ]},
        {"id": "sprint7", "name": "Sprint 7 — CITES, Comptabilité, Généalogie & GPS", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Historique", "status": "done", "page": "/admin/history"},
             {"name": "CITES", "status": "done", "page": "/admin/cites"},
             {"name": "Comptabilité FEC", "status": "done", "page": "/admin/accounting"},
             {"name": "Généalogie", "status": "done", "page": "/admin/genealogy"},
             {"name": "Carte GPS interactive", "status": "done", "page": "/admin/gps"},
         ]},
        {"id": "sprint8", "name": "Sprint 8 — Alertes, Analytics, Élevage, IoT, Tickets, Messagerie, Parrainage, Ventes", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Alertes & Surveillance", "status": "done", "page": "/admin/alertes"},
             {"name": "Analytics", "status": "done", "page": "/admin/analytics"},
             {"name": "Élevage & Génétique", "status": "done", "page": "/admin/elevage"},
             {"name": "IoT & Capteurs", "status": "done", "page": "/admin/iot"},
             {"name": "Tickets & Support", "status": "done", "page": "/admin/tickets"},
             {"name": "Messagerie interne", "status": "done", "page": "/admin/messaging"},
             {"name": "Parrainage d'animaux", "status": "done", "page": "/admin/parrainage"},
             {"name": "Statistiques ventes", "status": "done", "page": "/admin/ventes/stats"},
         ]},
        {"id": "sprint9", "name": "Sprint 9 — Kiosque, Tourisme, Prévisions, Reports, Corrections PDF", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Kiosque interactif", "status": "done", "page": "/admin/kiosque"},
             {"name": "Tourisme & visites", "status": "done", "page": "/admin/tourisme"},
             {"name": "Prévisions & projections", "status": "done", "page": "/admin/previsions"},
             {"name": "Rapports PDF", "status": "done", "page": "/admin/reports"},
             {"name": "Correction bug StockItem PDF", "status": "done", "page": "/admin/reports"},
         ]},
        {"id": "sprint10", "name": "Sprint 10 — Stock, BI, Export, Météo, GBIF, Partenaires", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Stock — Mouvements", "status": "done", "page": "/admin/stock/mouvements"},
             {"name": "Stock — Demandes", "status": "done", "page": "/admin/stock/demandes"},
             {"name": "BI Dashboard", "status": "done", "page": "/admin/bi"},
             {"name": "Export CSV/PDF", "status": "done", "page": "/admin/export"},
             {"name": "Météo & recommandations", "status": "done", "page": "/admin/meteo"},
             {"name": "GBIF Taxonomie", "status": "done", "page": "/admin/gbif"},
             {"name": "Partenaires", "status": "done", "page": "/admin/partners"},
         ]},
        {"id": "sprint11", "name": "Sprint 11 — Enclos, ML, Realtime, Push FCM, Sites, Advanced Reports, Gallery", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Enclos & Habitats", "status": "done", "page": "/admin/animaux/enclos"},
             {"name": "ML & Prédictions IA", "status": "done", "page": "/admin/ml"},
             {"name": "Realtime & Métriques", "status": "done", "page": "/admin/realtime"},
             {"name": "Push FCM & Notifications", "status": "done", "page": "/admin/push-fcm"},
             {"name": "Sites & Localisations", "status": "done", "page": "/admin/sites"},
             {"name": "Rapports avancés CITES", "status": "done", "page": "/admin/advanced-reports"},
             {"name": "Galerie Photo", "status": "done", "page": "/admin/gallery"},
             {"name": "Fix gallery backend (GET /gallery)", "status": "done", "page": "/admin/gallery"},
         ]},
        {"id": "sprint12", "name": "Sprint 12 — Stripe, Webhooks, Workflows, Auto-reports, Security, Import, API v2", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Stripe & Paiements", "status": "done", "page": "/admin/stripe"},
             {"name": "Webhooks", "status": "done", "page": "/admin/webhooks"},
             {"name": "Workflows & Automatisation", "status": "done", "page": "/admin/workflows"},
             {"name": "Rapports automatiques", "status": "done", "page": "/admin/auto-reports"},
             {"name": "Sécurité & Audit", "status": "done", "page": "/admin/security"},
             {"name": "Import de données", "status": "done", "page": "/admin/import"},
             {"name": "API Publique v2", "status": "done", "page": "/admin/api-v2"},
             {"name": "Fix PDFDocument import (advanced-reports)", "status": "done", "page": "/admin/advanced-reports"},
         ]},
        {"id": "sprint13", "name": "Sprint 13 — Contact Messages, Checkout Stripe, Pages Publiques", "status": "done", "completedAt": "2026-03-08",
         "tasks": [
             {"name": "Module Contact Messages (backend + DB)", "status": "done", "page": "/admin/contact-messages"},
             {"name": "Page Contact Messages connectée", "status": "done", "page": "/admin/contact-messages"},
             {"name": "Checkout Stripe connecté", "status": "done", "page": "/public/checkout"},
             {"name": "Page publique vitrine mise à jour", "status": "done", "page": "/public"},
             {"name": "Tables ContactMessage & ContactReply créées", "status": "done", "page": "/admin/contact-messages"},
         ]},
        {"id": "sprint14", "name": "Sprint 14 — Validation & Finalisation des 14 Pages Connectées", "status": "done", "startedAt": "2026-03-09", "completedAt": "2026-03-09",
         "tasks": [
             {"name": "Valider /admin/workflows/[id] — détail workflow avec éditeur", "status": "done", "page": "/admin/workflows/[id]"},
             {"name": "Valider /admin/animaux/[id] — fiche animal complète", "status": "done", "page": "/admin/animaux/[id]"},
             {"name": "Valider /admin/documents — gestion documentaire", "status": "done", "page": "/admin/documents"},
             {"name": "Valider /admin/animaux/couvees/[id] — détail couvée", "status": "done", "page": "/admin/animaux/couvees/[id]"},
             {"name": "Valider /admin/cites — registre CITES", "status": "done", "page": "/admin/cites"},
             {"name": "Valider /admin/medical/calendrier — calendrier vétérinaire", "status": "done", "page": "/admin/medical/calendrier"},
             {"name": "Valider /admin — tableau de bord principal", "status": "done", "page": "/admin"},
             {"name": "Valider /admin/security — gestion sécurité", "status": "done", "page": "/admin/security"},
             {"name": "Valider /admin/swagger — documentation API", "status": "done", "page": "/admin/swagger"},
             {"name": "Valider /admin/api-v2 — API publique v2", "status": "done", "page": "/admin/api-v2"},
             {"name": "Valider /admin/websocket — monitoring temps réel", "status": "done", "page": "/admin/websocket"},
             {"name": "Valider /admin/formation/cohortes — gestion cohortes", "status": "done", "page": "/admin/formation/cohortes"},
             {"name": "Valider /admin/formation/mon-parcours/[enrollmentId] — suivi apprenant", "status": "done", "page": "/admin/formation/mon-parcours/[enrollmentId]"},
             {"name": "Valider /admin/ventes/[id] — détail vente", "status": "done", "page": "/admin/ventes/[id]"},
             {"name": "Finaliser module export (dette technique 70%)", "status": "done", "page": None},
         ]},
    ]

    # Sortie JS
    output = f"""// ============================================================
// LFTG Platform — Données de cartographie
// Généré automatiquement le {stats['generatedAt']}
// NE PAS MODIFIER MANUELLEMENT — utiliser: python3 scripts/generate-map-data.py
// ============================================================

const LFTG_MAP_DATA = {{
  stats: {json.dumps(stats, ensure_ascii=False, indent=2)},
  pages: {json.dumps(pages, ensure_ascii=False, indent=2)},
  modules: {json.dumps(modules, ensure_ascii=False, indent=2)},
  models: {json.dumps(models, ensure_ascii=False, indent=2)},
  roadmap: {json.dumps(roadmap, ensure_ascii=False, indent=2)},
  sprints: {json.dumps(sprints, ensure_ascii=False, indent=2)},
}};

if (typeof module !== 'undefined') module.exports = LFTG_MAP_DATA;
"""
    print(output)

if __name__ == "__main__":
    main()
