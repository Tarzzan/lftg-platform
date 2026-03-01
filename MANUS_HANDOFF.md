# LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> Auteur : William MERI
> Date : Mars 2026
> Version : **2.0.0**

---

## État du projet

La **Phase 2** du projet LFTG Platform est complète. L'ensemble du code source est versionné sur GitHub : `Tarzzan/lftg-platform`.

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

#### Backend
- **Module SSE** : `NotificationsService` + `NotificationsController` avec Server-Sent Events pour les alertes temps réel (stock faible, transitions workflow, événements couvées)
- **Module Export** : `ExportService` + `ExportController` pour la génération CSV et PDF des rapports (stock, animaux, audit, formations)
- **Module Stats** : `StatsService` + `StatsController` pour les données des graphiques du dashboard (évolution stock, animaux par espèce, workflows par statut)
- **app.module.ts** mis à jour avec les 3 nouveaux modules

#### Frontend — Modals CRUD
- `Modal.tsx` : composant réutilisable avec overlay, animations, tailles configurables
- `StockArticleModal.tsx` : création/édition d'articles (nom, catégorie, quantité, seuil, unité, emplacement)
- `AnimalModal.tsx` : création/édition d'animaux (nom, espèce, sexe, date naissance, statut, enclos)
- `BroodModal.tsx` : création de couvées (espèce, mâle, femelle, date ponte, nb œufs, incubateur)
- `StockMovementModal.tsx` : enregistrement de mouvements de stock (entrée/sortie/ajustement, quantité, motif)
- `UserModal.tsx` : création/édition d'utilisateurs (email, nom, mot de passe, rôles)
- `CourseModal.tsx` : création/édition de formations (titre, description, niveau, durée, catégorie, tags, publication)

#### Frontend — Pages enrichies
- **Dashboard** (`/admin`) : graphiques Recharts (AreaChart évolution stock, BarChart animaux/espèce, PieChart workflows), stats temps réel via React Query
- **Stock Articles** (`/admin/stock/articles`) : filtres catégorie + alertes, tri colonnes, boutons Modifier/Supprimer/Mouvement, export CSV
- **Animaux Liste** (`/admin/animaux/liste`) : filtres statut + sexe, grille avec hover actions, export CSV
- **Workflow Détail** (`/admin/workflows/[id]`) : timeline des étapes, boutons approve/reject/cancel selon permissions
- **Formation Cours** (`/admin/formation/cours`) : filtres catégorie + publié/brouillon, grille avec thumbnails
- **Formation Cohortes** (`/admin/formation/cohortes`) : nouvelle page avec tableau, modal création, filtres statut

#### Frontend — UI & Thème
- `ThemeToggle.tsx` : bouton mode sombre/clair avec persistance localStorage
- `NotificationBell.tsx` : cloche avec compteur non-lus, SSE subscription, dismiss, mark-all-read
- `admin/layout.tsx` : intégration ThemeToggle + NotificationBell dans la topbar, ajout nav Cohortes
- `tailwind.config.ts` : ajout animations (fade-in, slide-up, zoom-in-95) et keyframes
- `lib/api.ts` : client API enrichi avec tous les endpoints Phase 2

#### DevOps
- `.github/workflows/ci.yml` : pipeline CI (lint → test → build → docker push GHCR) sur push/PR main/develop
- `.github/workflows/release.yml` : pipeline release (tag v*.*.* → build → images versionnées → GitHub Release avec changelog)

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — API REST
│   │   └── src/modules/
│   │       ├── auth/         # JWT + Local strategies
│   │       ├── users/        # CRUD utilisateurs
│   │       ├── roles/        # RBAC/ABAC
│   │       ├── plugins/      # Plugin Registry
│   │       ├── workflows/    # Workflow Engine
│   │       ├── audit/        # Audit Log
│   │       ├── notifications/ # SSE temps réel  [NEW v2]
│   │       ├── export/       # CSV/PDF export   [NEW v2]
│   │       └── stats/        # Stats dashboard  [NEW v2]
│   └── frontend/         # Next.js 14 + Tailwind
│       └── src/
│           ├── app/admin/
│           │   ├── page.tsx              # Dashboard + Recharts
│           │   ├── users/
│           │   ├── workflows/
│           │   │   └── [id]/page.tsx     # Détail workflow [NEW v2]
│           │   ├── stock/articles/       # Filtres + modals [NEW v2]
│           │   ├── animaux/liste/        # Filtres + modals [NEW v2]
│           │   ├── formation/
│           │   │   ├── cours/            # Filtres + modals [NEW v2]
│           │   │   └── cohortes/         # Nouvelle page    [NEW v2]
│           │   └── audit/
│           ├── components/
│           │   ├── modals/               # 7 modals CRUD    [NEW v2]
│           │   └── ui/
│           │       ├── Modal.tsx         # Composant base   [NEW v2]
│           │       ├── ThemeToggle.tsx   # Mode sombre      [NEW v2]
│           │       └── NotificationBell.tsx # SSE notifs    [NEW v2]
│           └── lib/
│               ├── api.ts                # Client API enrichi
│               └── auth-store.ts
├── packages/core/        # Prisma schema + seed
├── plugins/
│   ├── personnel/
│   ├── stock/
│   ├── animaux-couvees/
│   └── formation/
└── .github/workflows/    # CI/CD GitHub Actions [NEW v2]
    ├── ci.yml
    └── release.yml
```

---

## Backlog Phase 3 (v3.0.0)

### Priorité haute
- [ ] **Tests E2E** : Playwright pour les flux critiques (login, CRUD animaux, workflow approval)
- [ ] **Page détail animal** : historique médical, photos, fiche complète avec timeline
- [ ] **Éditeur de workflow** : drag-and-drop pour créer des workflows visuellement (React Flow)
- [ ] **Module médical** : visites vétérinaires, traitements, vaccinations, ordonnances
- [ ] **Notifications email** : intégration Resend/SendGrid pour les alertes critiques

### Priorité moyenne
- [ ] **Dashboard mobile** : responsive complet, PWA manifest, service worker
- [ ] **Rapports PDF** : rapport mensuel stock, rapport animaux, rapport formations (avec graphiques)
- [ ] **Import CSV** : import en masse d'animaux, d'articles stock, d'utilisateurs
- [ ] **Calendrier** : planning des soins, formations, événements (FullCalendar)
- [ ] **Recherche globale** : barre de recherche cross-entités (Cmd+K) avec résultats instantanés

### Priorité basse
- [ ] **Multi-tenant** : support de plusieurs fermes/sites avec isolation des données
- [ ] **API publique** : documentation Swagger enrichie, rate limiting, API keys
- [ ] **Intégration CITES** : vérification automatique des espèces protégées
- [ ] **Analytics avancés** : tableaux de bord personnalisables par rôle
- [ ] **Application mobile** : Expo React Native avec synchronisation offline

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

# Tests
pnpm --filter @lftg/backend test
pnpm --filter @lftg/backend test:cov

# Build production
pnpm --filter @lftg/backend build
pnpm --filter @lftg/frontend build

# Docker production
docker-compose up -d

# Créer une release
git tag v2.0.0 && git push origin v2.0.0
```

---

## Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@lftg.fr | Admin1234! | Administrateur |
| soigneur@lftg.fr | User1234! | Soigneur |
| gestionnaire@lftg.fr | User1234! | Gestionnaire |

---

*Signé : William MERI — LFTG Platform v2.0.0 — Mars 2026*
