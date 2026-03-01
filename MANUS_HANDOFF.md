# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **6.0.0**

---

## État du projet

| Version | Statut | Contenu |
|---------|--------|---------|
| v1.0.0 | ✅ Livré | Monorepo, core NestJS, 4 plugins, frontend Next.js |
| v2.0.0 | ✅ Livré | SSE, modals CRUD, Recharts, dark mode, CI/CD |
| v3.0.0 | ✅ Livré | Module médical, React Flow, Cmd+K, calendrier, import CSV, Playwright, PWA |
| v4.0.0 | ✅ Livré | Module enclos (Leaflet), module ventes (facturation), Swagger/OpenAPI, détail couvée, dashboard personnalisable, rapports PDF natifs, DataTable/Badge/LoadingSpinner, tests E2E enrichis |
| v5.0.0 | ✅ Livré | Recherche full-text, push VAPID, agenda iCal, CITES, documents, historique modifications, stats ventes avancées, rapports PDF Puppeteer |
| v6.0.0 | ✅ Livré | Personnel RH complet, planning des gardes, gestion congés, rapports PDF galerie, agenda vue semaine, notifications push client |

---

## Ce qui a été réalisé

### Phase 1 — v1.0.0 (Fondations)
- Monorepo `pnpm workspaces` avec la structure `apps/`, `packages/`, `plugins/`
- Backend NestJS : Auth JWT, RBAC/ABAC, Workflow Engine, Plugin Registry, Audit Log
- 4 plugins métier : personnel, stock, animaux-couvées, formation
- Frontend Next.js 14 + Tailwind — Design System "Biodiversité Guyane"
- Docker-compose prod + dev, seed, tests unitaires
- README, .env.example, labels GitHub, milestones, issues backlog

### Phase 2 — v2.0.0 (Interactivité & DevOps)
- **Backend** : Module SSE notifications, module export CSV/PDF, module stats dashboard
- **Frontend** : 7 modals CRUD (Stock, Animal, Couvée, Mouvement, User, Cours), Dashboard Recharts
- **UI** : Mode sombre (ThemeToggle), cloche SSE (NotificationBell), animations Tailwind
- **Pages enrichies** : Détail workflow, filtres avancés stock/animaux/formations, cohortes
- **DevOps** : `ci.yml` (lint → test → build → GHCR), `release.yml` (tag → GitHub Release)

### Phase 3 — v3.0.0 (Médical, Recherche & PWA)
- **Backend** : Module médical, module email Resend, module import CSV, rapports PDF HTML
- **Frontend** : Détail animal (4 onglets), espèces, dashboard médical, calendrier soins, éditeur workflow React Flow, Cmd+K, import CSV, page offline
- **PWA** : manifest.json, service worker, raccourcis
- **Tests E2E** : 5 suites Playwright (auth, dashboard, animaux, stock, workflows)

### Phase 4 — v4.0.0 (Enclos, Ventes & Swagger)
- **Backend** : Module enclos (GeoJSON), module ventes (facturation), Swagger/OpenAPI, rapports PDF natifs, schéma Prisma v4 (32 modèles)
- **Frontend** : Détail couvée (Recharts), enclos (Leaflet), ventes (KPIs + facturation), dashboard personnalisable (8 widgets), Swagger UI, composants DataTable/Badge/LoadingSpinner
- **Tests E2E** : `ventes.spec.ts` (8 tests), `medical-enclos.spec.ts` (12 tests)

### Phase 5 — v5.0.0 (Conformité, Documents & Historique)
- **Backend** : Recherche full-text, push VAPID, agenda iCal, CITES, documents Multer, historique JSON diff, PDF Puppeteer
- **Frontend** : Détail enclos, agenda mensuel, CITES (3 onglets), documents (drag-and-drop), historique (timeline + stats), stats ventes avancées

### Phase 6 — v6.0.0 (Personnel RH, Rapports & Agenda enrichi)
- **Backend** : Module personnel enrichi (fiches, planning, congés, compétences), module reports (6 types de rapports PDF)
- **Frontend** :
  - Liste employés avec KPIs RH (effectif, taux présence, heures sup, congés en attente)
  - Fiche détail employé (5 onglets : Profil, Planning, Congés, Compétences, Documents)
  - Planning des gardes (vue semaine avec grille horaire par employé, légende Matin/AM/Nuit/Weekend)
  - Gestion des congés (tableau de bord, demandes, approbations, soldes par type)
  - Rapports PDF (galerie de 6 types : mensuel, médical, CITES, RH, stock, ventes)
  - Agenda vue semaine (grille horaire 7h-20h, filtres par type, événements colorés)
  - Composant `PushNotifications.tsx` (abonnement VAPID, permission browser, centre de notifications)
- **Navigation** : Planning gardes + Congés dans Personnel RH, Agenda semaine + Rapports PDF dans Outils

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — 23 modules
│   │   └── src/modules/
│   │       ├── auth/           # JWT + Passport
│   │       ├── users/          # Gestion utilisateurs
│   │       ├── roles/          # RBAC/ABAC
│   │       ├── plugins/        # Plugin Registry
│   │       ├── workflows/      # Workflow Engine
│   │       ├── audit/          # Audit Log
│   │       ├── notifications/  # SSE temps réel [v2]
│   │       ├── export/         # CSV + PDF HTML + PDF Puppeteer [v2-v5]
│   │       ├── stats/          # Statistiques dashboard [v2]
│   │       ├── medical/        # Module médical [v3]
│   │       ├── email/          # Notifications email Resend [v3]
│   │       ├── import/         # Import CSV en masse [v3]
│   │       ├── enclos/         # Enclos + GeoJSON [v4]
│   │       ├── ventes/         # Ventes + facturation [v4]
│   │       ├── search/         # Recherche full-text [v5]
│   │       ├── push/           # Notifications push VAPID [v5]
│   │       ├── agenda/         # Calendrier + iCal [v5]
│   │       ├── cites/          # Conformité CITES [v5]
│   │       ├── documents/      # Gestion documents [v5]
│   │       ├── history/        # Historique modifications [v5]
│   │       ├── personnel/      # RH — fiches, planning, congés [v6]
│   │       └── reports/        # Rapports PDF complets [v6]
│   └── frontend/         # Next.js 14 + Tailwind — 38+ pages
├── plugins/
│   ├── personnel/
│   ├── stock/
│   ├── animaux-couvees/
│   └── formation/
├── packages/core/
│   └── prisma/           # Schéma + seed (32 modèles)
├── .github/workflows/    # CI/CD GitHub Actions
├── screenshots/          # 12 captures d'écran
└── docs/                 # Architecture + Phase reports
```

---

## Pages frontend (38+ pages)

### Administration
- `/admin` — Dashboard personnalisable (8 widgets)
- `/admin/users`, `/admin/roles`, `/admin/workflows`, `/admin/workflows/[id]`
- `/admin/workflows/editor` — Éditeur visuel React Flow
- `/admin/audit`, `/admin/import`, `/admin/docs` — Swagger UI
- `/admin/reports` — Rapports PDF (6 types) **[v6]**

### Personnel (RH)
- `/admin/personnel/employes` — Liste + KPIs **[v6]**
- `/admin/personnel/employes/[id]` — Fiche détail (5 onglets) **[v6]**
- `/admin/personnel/planning` — Planning gardes vue semaine **[v6]**
- `/admin/personnel/conges` — Gestion congés + approbations **[v6]**

### Stock
- `/admin/stock/articles`, `/admin/stock/mouvements`, `/admin/stock/demandes`

### Animaux & Couvées
- `/admin/animaux/liste`, `/admin/animaux/especes`, `/admin/animaux/[id]`
- `/admin/animaux/enclos`, `/admin/animaux/enclos/[id]`
- `/admin/animaux/couvees`, `/admin/animaux/couvees/[id]`

### Médical
- `/admin/medical`, `/admin/medical/calendrier`

### Formation
- `/admin/formation/cours`, `/admin/formation/cohortes`, `/admin/formation/mes-formations`

### Ventes
- `/admin/ventes`, `/admin/ventes/[id]`, `/admin/ventes/stats`

### Conformité & Docs
- `/admin/cites`, `/admin/documents`

### Outils
- `/admin/agenda` — Agenda mensuel
- `/admin/agenda/semaine` — Agenda vue semaine **[v6]**
- `/admin/history` — Historique des modifications

---

## Backlog Phase 7 (v7.0.0)

### Priorité haute
- [ ] **Application mobile Expo** — React Native avec scan QR, alertes push, soins rapides
- [ ] **Module messagerie interne** — chat entre employés, groupes par zone, notifications
- [ ] **Tableau de bord BI** — analytique avancée, KPIs personnalisés, export Excel
- [ ] **Intégration API CITES externe** — vérification automatique des espèces protégées

### Priorité normale
- [ ] **Module vétérinaire externe** — portail partenaires, accès limité aux dossiers médicaux
- [ ] **Système de tickets/incidents** — signalement, suivi, résolution, historique
- [ ] **Notifications SMS** — Twilio pour alertes critiques (santé animale, stock critique)
- [ ] **Export comptabilité** — format FEC pour intégration logiciel comptable
- [ ] **Module élevage** — généalogie des animaux, arbre généalogique, coefficient de consanguinité

### Priorité basse
- [ ] **Application kiosque** — tablette soigneurs pour saisie rapide des soins
- [ ] **Module tourisme** — gestion des visites guidées, réservations, groupes scolaires
- [ ] **Intégration caméras IP** — flux vidéo des enclos, alertes mouvement
- [ ] **API publique** — partenaires éleveurs, accès limité aux données de reproduction

---

## Commandes utiles

```bash
# Développement local
cp .env.example .env
docker-compose -f docker-compose.dev.yml up -d   # PostgreSQL + Redis
pnpm install
pnpm --filter @lftg/core prisma:generate
pnpm --filter @lftg/core prisma:migrate
pnpm --filter @lftg/core prisma:seed
pnpm dev                                          # Backend :3001 + Frontend :3000

# Tests unitaires
pnpm --filter @lftg/backend test
pnpm --filter @lftg/backend test:cov

# Tests E2E Playwright
pnpm --filter @lftg/frontend test:e2e
pnpm --filter @lftg/frontend test:e2e:ui          # Mode interactif

# Build production
pnpm build
docker-compose build && docker-compose up -d

# Rapports PDF
curl http://localhost:3001/reports/monthly?year=2026&month=3 -o rapport.html
curl http://localhost:3001/reports/stock/inventory -o inventaire.html
curl http://localhost:3001/reports/animal/{id}/medical -o dossier.html

# Release
git tag v7.0.0 && git push origin v7.0.0
```

---

## Variables d'environnement requises

```env
DATABASE_URL="postgresql://lftg:lftg_secret@localhost:5432/lftg_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@lftg.fr"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:3001"
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_EMAIL="admin@lftg.fr"
E2E_USER_EMAIL="admin@lftg.fr"
E2E_USER_PASSWORD="Admin1234!"
```

---

## Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@lftg.fr | Admin1234! | Administrateur |
| soigneur@lftg.fr | User1234! | Soigneur |
| gestionnaire@lftg.fr | User1234! | Gestionnaire |

---

*Signé : William MERI — LFTG Platform v6.0.0 — Mars 2026*
