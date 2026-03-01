# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> Auteur : William MERI  
> Date : Mars 2026  
> Version : **3.0.0**

---

## État du projet

| Version | Statut | Contenu |
|---------|--------|---------|
| v1.0.0 | ✅ Livré | Monorepo, core NestJS, 4 plugins, frontend Next.js |
| v2.0.0 | ✅ Livré | SSE, modals CRUD, Recharts, dark mode, CI/CD |
| v3.0.0 | ✅ Livré | Module médical, React Flow, Cmd+K, calendrier, import CSV, Playwright, PWA |

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

## Backlog Phase 4 (v4.0.0)

### Priorité haute
- [ ] **Tests E2E complets** — Couvrir 80% des parcours utilisateur avec Playwright
- [ ] **Page détail couvée** — Suivi des œufs, éclosions, mortalité avec graphiques
- [ ] **Module enclos complet** — CRUD + carte interactive des enclos (Leaflet)
- [ ] **Notifications push natives** — Intégration Web Push API avec le service worker
- [ ] **Rapports PDF natifs** — Conversion HTML→PDF côté serveur (Puppeteer ou WeasyPrint)

### Priorité moyenne
- [ ] **Recherche full-text** — pg_trgm ou Elasticsearch pour la recherche avancée
- [ ] **API Swagger complète** — Documentation OpenAPI avec exemples interactifs
- [ ] **Module ventes** — Gestion des ventes d'animaux et produits dérivés
- [ ] **Dashboard personnalisable** — Widgets drag-and-drop (React Grid Layout)
- [ ] **Historique des prix** — Suivi du coût des aliments et médicaments

### Priorité basse
- [ ] **Application mobile** — React Native / Expo pour les soigneurs en tournée
- [ ] **Intégration GPS** — Géolocalisation des enclos sur carte Leaflet
- [ ] **IA — Détection anomalies** — Alertes automatiques sur les indicateurs de santé
- [ ] **Multi-tenant** — Support de plusieurs fermes sur la même instance
- [ ] **Backup automatique** — Export quotidien chiffré vers S3

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
