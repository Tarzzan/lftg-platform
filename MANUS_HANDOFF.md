# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> Auteur : William MERI  
> Date : Mars 2026  
> Version : **5.0.0**

---

## État du projet

| Version | Statut | Contenu |
|---------|--------|---------|
| v1.0.0 | ✅ Livré | Monorepo, core NestJS, 4 plugins, frontend Next.js |
| v2.0.0 | ✅ Livré | SSE, modals CRUD, Recharts, dark mode, CI/CD |
| v3.0.0 | ✅ Livré | Module médical, React Flow, Cmd+K, calendrier, import CSV, Playwright, PWA |
| v4.0.0 | ✅ Livré | Module enclos (Leaflet), module ventes (facturation), Swagger/OpenAPI, détail couvée, dashboard personnalisable, rapports PDF natifs, DataTable/Badge/LoadingSpinner, tests E2E enrichis |
| v5.0.0 | ✅ Livré | Recherche full-text, push VAPID, agenda iCal, CITES, documents, historique modifications, stats ventes avancées, rapports PDF Puppeteer |

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

#### Backend
- **Module médical** : `MedicalService` + `MedicalController` — visites vétérinaires, traitements, vaccinations, ordonnances
- **Module email** : `EmailService` avec Resend — templates HTML pour alertes stock, rappels médicaux, invitations formations
- **Module import** : `ImportService` + `ImportController` — import CSV en masse pour animaux, stock, utilisateurs avec validation et rapport d'erreurs
- **Rapports PDF enrichis** : `PdfReportService` + `PdfReportController` — rapport mensuel, dossier médical animal, inventaire stock (HTML→PDF)
- **`app.module.ts`** mis à jour avec les 3 nouveaux modules

#### Frontend
- **Page détail animal** (`/admin/animaux/[id]`) : 4 onglets (Fiche, Historique médical, Vaccinations, Traitements), timeline médicale, galerie photos
- **Page espèces** (`/admin/animaux/especes`) : CRUD espèces avec statut CITES, conservation, taxonomie
- **Dashboard médical** (`/admin/medical`) : KPIs, visites récentes, alertes rappels, prochaines visites
- **Calendrier des soins** (`/admin/medical/calendrier`) : calendrier mensuel interactif avec événements colorés par type
- **Éditeur de workflow** (`/admin/workflows/editor`) : canvas visuel avec palette d'étapes, connexions SVG, panneau de propriétés
- **Recherche globale Cmd+K** : `CommandPalette.tsx` avec résultats API temps réel, navigation clavier, raccourci ⌘K
- **Import CSV** (`/admin/import`) : drag-and-drop, prévisualisation, 3 types (animaux/stock/users), rapport d'import
- **Page offline** (`/offline`) : fallback PWA

#### PWA
- `manifest.json` : installable sur mobile/desktop avec shortcuts
- `sw.js` : service worker Network First + Cache First + notifications push
- `layout.tsx` : enregistrement automatique du service worker

#### Tests E2E
- `playwright.config.ts` : configuration multi-navigateurs (Chrome, Firefox, Mobile)
- `auth.setup.ts` : authentification et sauvegarde du state
- `dashboard.spec.ts` : dashboard, navigation, Cmd+K, graphiques
- `animaux.spec.ts` : liste, filtres, modals, détail animal
- `stock.spec.ts` : articles, filtres, import CSV
- `workflows.spec.ts` : liste, éditeur, calendrier médical

#### Navigation
- Nouvelle section **Médical** dans la sidebar (Suivi médical + Calendrier)
- **Import CSV** ajouté dans Administration
- Bouton recherche ⌘K dans la topbar et la sidebar

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — API REST + SSE
│   │   └── src/modules/
│   │       ├── auth/           # JWT + Passport
│   │       ├── users/          # Gestion utilisateurs
│   │       ├── roles/          # RBAC/ABAC
│   │       ├── plugins/        # Plugin Registry
│   │       ├── workflows/      # Workflow Engine
│   │       ├── audit/          # Audit Log
│   │       ├── notifications/  # SSE temps réel [v2]
│   │       ├── export/         # CSV + Rapports PDF HTML [v2+v3]
│   │       ├── stats/          # Statistiques dashboard [v2]
│   │       ├── medical/        # Module médical [v3]
│   │       ├── email/          # Notifications email Resend [v3]
│   │       └── import/         # Import CSV en masse [v3]
│   └── frontend/         # Next.js 14 + Tailwind
│       ├── src/app/admin/
│       │   ├── page.tsx              # Dashboard Recharts
│       │   ├── users/
│       │   ├── animaux/
│       │   │   ├── liste/            # Liste + filtres + modal
│       │   │   ├── [id]/             # Détail + timeline médicale [v3]
│       │   │   ├── especes/          # Gestion espèces [v3]
│       │   │   ├── enclos/
│       │   │   └── couvees/
│       │   ├── medical/
│       │   │   ├── page.tsx          # Dashboard médical [v3]
│       │   │   └── calendrier/       # Calendrier des soins [v3]
│       │   ├── stock/articles/
│       │   ├── formation/
│       │   │   ├── cours/
│       │   │   └── cohortes/
│       │   ├── workflows/
│       │   │   ├── page.tsx
│       │   │   ├── [id]/             # Détail workflow [v2]
│       │   │   └── editor/           # Éditeur React Flow [v3]
│       │   ├── import/               # Import CSV [v3]
│       │   └── audit/
│       ├── src/components/
│       │   ├── ui/
│       │   │   ├── Modal.tsx
│       │   │   ├── ThemeToggle.tsx
│       │   │   ├── NotificationBell.tsx
│       │   │   └── CommandPalette.tsx  # Cmd+K [v3]
│       │   └── modals/               # 7 modals CRUD
│       ├── e2e/                      # Tests Playwright [v3]
│       └── public/
│           ├── manifest.json         # PWA manifest [v3]
│           └── sw.js                 # Service Worker [v3]
├── plugins/
│   ├── personnel/
│   ├── stock/
│   ├── animaux-couvees/
│   └── formation/
├── packages/core/
│   └── prisma/           # Schéma + seed (30+ modèles)
├── .github/workflows/    # CI/CD GitHub Actions
│   ├── ci.yml
│   └── release.yml
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## ✅ Phase 4 — v4.0.0 (Complétée)

### Backend
- **Module enclos** : `EnclosService` + `EnclosController` — CRUD enclos avec GeoJSON, capacité, taux d'occupation, historique des résidents
- **Module ventes** : `VentesService` + `VentesController` — CRUD ventes avec lignes d'articles, TVA, facturation HTML, statuts (PENDING → CONFIRMED → COMPLETED), export PDF
- **Swagger/OpenAPI** : `@nestjs/swagger` intégré dans `main.ts` — documentation interactive sur `/api`, spec JSON sur `/api-json`
- **Rapports PDF natifs** : `PdfNativeService` — génération via WeasyPrint/wkhtmltopdf avec templates HTML riches
- **Schéma Prisma v4** : 32 modèles — ajout de `Sale`, `SaleItem`, `Enclosure` enrichi avec GeoJSON

### Frontend
- **Page détail couvée** (`/admin/animaux/couvees/[id]`) : 3 onglets, graphiques Recharts (taux d'éclosion, mortalité), timeline événements, barre de progression
- **Module enclos** (`/admin/animaux/enclos`) : carte Leaflet interactive, marqueurs colorés par taux d'occupation, vue grille + vue carte, modal de création avec coordonnées GPS
- **Module ventes** (`/admin/ventes`) : liste avec KPIs, graphique revenus 7 jours, filtres, modal de création avec lignes d'articles et calcul TVA
- **Détail vente** (`/admin/ventes/[id]`) : facture complète avec acheteur, lignes, totaux HT/TVA/TTC, actions de changement de statut
- **Dashboard personnalisable** : 8 widgets configurables (KPIs, revenus, animaux, stock, workflows, couvées, médical, ventes), persistance localStorage, mode édition
- **Documentation API** (`/admin/docs`) : iframe Swagger UI + résumé des 8 modules avec comptage d'endpoints
- **Composants UI réutilisables** : `DataTable` (tri + pagination), `Badge`/`StatusBadge`, `LoadingSpinner`, `EmptyState`, page 404 animée
- **Navigation** : sections Ventes et Développeur ajoutées dans la sidebar

### Tests E2E
- `ventes.spec.ts` : 8 tests (KPIs, graphique, modal, validation, filtres, lignes)
- `medical-enclos.spec.ts` : 12 tests (médical, calendrier, enclos, dashboard, docs API)

---

## ✅ Phase 5 — v5.0.0 (Complétée)

### Backend (6 nouveaux modules)
- **Module search** : `SearchService` — recherche full-text globale sur animaux, stock, ventes, utilisateurs
- **Module push** : `PushService` — Web Push API VAPID, gestion des abonnements, envoi de notifications
- **Module agenda** : `AgendaService` — planning des soins, récurrence, export iCal (RFC 5545)
- **Module CITES** : `CitesService` — permis, conformité réglementaire, alertes d'expiration
- **Module documents** : `DocumentsService` — upload Multer, catégorisation, tags, liaison aux entités
- **Module history** : `HistoryService` — traçabilité complète, diff JSON des modifications
- **Service PDF Puppeteer** : `PdfPuppeteerService` — rapports haute qualité via Chromium headless

### Frontend (6 nouvelles pages)
- **Page détail enclos** (`/admin/animaux/enclos/[id]`) : carte Leaflet zoomée, liste résidents, historique incidents
- **Agenda** (`/admin/agenda`) : calendrier mensuel interactif, filtres par type, panneau détail, export iCal
- **CITES** (`/admin/cites`) : liste des permis avec statuts, onglets Permis/Vérification/Conformité
- **Documents** (`/admin/documents`) : vue grille + liste, drag-and-drop upload, filtres par catégorie
- **Historique** (`/admin/history`) : timeline des modifications, filtres entité/action, stats sidebar
- **Stats Ventes** (`/admin/ventes/stats`) : KPIs, barres mensuelles, donut répartition clients, top espèces

### Navigation
- Sections **Conformité & Docs** (CITES + Documents) et **Outils** (Agenda + Historique) ajoutées
- Lien **Statistiques** dans la section Ventes

---

## Backlog Phase 6 (v6.0.0)

### Priorité haute
- [ ] **Application mobile Expo** — React Native avec fonctionnalités essentielles (scan QR, alertes push)
- [ ] **Notifications push côté client** — abonnement VAPID, permission browser, réception des notifications
- [ ] **Module personnel enrichi** — fiche employé complète, planning des gardes, congés, compétences
- [ ] **Rapports PDF Puppeteer** — rapport mensuel complet, bilan CITES, dossier médical animal

### Priorité normale
- [ ] **Recherche full-text pg_trgm** — index PostgreSQL, highlighting des résultats, score de pertinence
- [ ] **Module agenda enrichi** — vue semaine, vue liste, récurrence RRULE avancée, invitations email
- [ ] **Gestion des documents enrichie** — versioning, partage, signature électronique
- [ ] **Module CITES enrichi** — alertes email d'expiration, génération PDF des permis, API CITES externe

### Priorité basse
- [ ] **Internationalisation** — i18n (fr/en/es) avec next-intl
- [ ] **Multi-tenant** — support de plusieurs fermes dans une même instance
- [ ] **Backup automatique** — export quotidien chiffré vers S3
- [ ] **IA — Détection anomalies** — alertes automatiques sur les indicateurs de santé

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

# Tests E2E
pnpm --filter @lftg/frontend test:e2e
pnpm --filter @lftg/frontend test:e2e:ui          # Mode interactif

# Build production
pnpm build
docker-compose build && docker-compose up -d

# Rapports
curl http://localhost:3001/reports/monthly?year=2026&month=3 -o rapport.html
curl http://localhost:3001/reports/stock/inventory -o inventaire.html
curl http://localhost:3001/reports/animal/{id}/medical -o dossier.html

# Release
git tag v3.0.0 && git push origin v3.0.0
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

*Signé : William MERI — LFTG Platform v3.0.0 — Mars 2026*
