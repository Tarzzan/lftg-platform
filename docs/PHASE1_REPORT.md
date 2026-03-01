# LFTG Platform — Rapport de Phase 1

> Auteur : William MERI  
> Date : 1er mars 2026  
> Version : 1.0.0  
> Dépôt : https://github.com/Tarzzan/lftg-platform

---

## Résumé exécutif

La **Phase 1** de la LFTG Platform est complète. L'ensemble du code source (85 fichiers, 2 commits) est versionné et disponible sur GitHub. La plateforme couvre l'intégralité du cahier des charges initial : architecture monorepo, backend NestJS avec moteur de workflows, système de plugins, et frontend Next.js avec le design system "Biodiversité Guyane".

---

## Livrables de la Phase 1

### 1. Infrastructure & DevOps

| Livrable | Statut | Description |
|----------|--------|-------------|
| Monorepo pnpm | ✅ | `apps/`, `packages/`, `plugins/` |
| Docker-compose production | ✅ | PostgreSQL + Backend + Frontend |
| Docker-compose développement | ✅ | PostgreSQL uniquement |
| Dockerfiles multi-stage | ✅ | Backend NestJS + Frontend Next.js |
| `.env.example` | ✅ | Variables documentées |
| GitHub Actions (CI) | 🔄 Backlog | Pipeline lint/test/build |

### 2. Backend NestJS (`apps/backend`)

| Module | Statut | Fonctionnalités |
|--------|--------|----------------|
| Auth | ✅ | JWT, Passport (local + jwt), register/login/me |
| RBAC/ABAC | ✅ | PermissionsGuard, permissions dynamiques en base |
| Workflow Engine | ✅ | Définitions JSON, instances, transitions, historique, événements |
| Plugin Registry | ✅ | Auto-enregistrement via manifests, menus, permissions |
| Audit Log | ✅ | Listener `@OnEvent`, journal complet |
| Users | ✅ | CRUD, assignation de rôles et équipes |
| Roles | ✅ | CRUD, gestion des permissions |
| Prisma | ✅ | Service global, schéma unifié |

### 3. Schéma Prisma (`packages/core`)

Le schéma couvre **30+ modèles** répartis en 5 domaines :

| Domaine | Modèles |
|---------|---------|
| Core | `User`, `Role`, `Permission`, `Team`, `WorkflowDefinition`, `WorkflowInstance`, `WorkflowHistory`, `AuditLog`, `Plugin` |
| Personnel | `Employee`, `Skill`, `EmployeeDocument`, `Leave` |
| Stock | `StockItem`, `StockMovement`, `StockRequest` |
| Animaux | `Species`, `Enclosure`, `Animal`, `AnimalEvent`, `Brood` |
| Formation | `Course`, `Chapter`, `Lesson`, `Quiz`, `QuizAnswer`, `Cohort`, `Enrollment` |

### 4. Plugins Métier

| Plugin | Endpoints | Fonctionnalités clés |
|--------|-----------|---------------------|
| `plugin-personnel` | 8 | Employés, compétences, documents RH, congés |
| `plugin-stock` | 10 | Articles, mouvements, alertes stock, demandes workflow |
| `plugin-animaux-couvees` | 12 | Espèces, enclos, animaux, événements santé, couvées/incubation |
| `plugin-formation` | 11 | Cours, chapitres, leçons, quiz, cohortes, inscriptions, progression |

### 5. Frontend Next.js (`apps/frontend`)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Authentification avec validation Zod |
| Dashboard | `/admin` | Stats, alertes stock, workflows récents |
| Utilisateurs | `/admin/users` | Liste avec rôles, équipes, statut |
| Articles stock | `/admin/stock/articles` | Inventaire avec alertes visuelles |
| Animaux | `/admin/animaux/liste` | Grille de cartes par espèce |
| Couvées | `/admin/animaux/couvees` | Suivi d'incubation avec barre de progression |
| Workflows | `/admin/workflows` | Instances par état, tableau de bord |
| Audit | `/admin/audit` | Journal filtrable avec détails JSON |
| Cours | `/admin/formation/cours` | Catalogue de formations |

### 6. Design System "Biodiversité Guyane"

| Palette | Hex | Usage |
|---------|-----|-------|
| `forest` | `#16a34a` | Primaire, actions, succès |
| `laterite` | `#ea580c` | Secondaire, alertes |
| `maroni` | `#3b82f6` | Accent, liens, badges |
| `gold` | `#f59e0b` | Avertissements, couvées |
| `wood` | `#78716c` | Neutres, textes |

Composants : `lftg-card`, `lftg-badge`, `sidebar-item`, `stat-card`, `page-header`, `jungle-overlay`.

### 7. Tests

| Fichier | Tests | Couverture |
|---------|-------|-----------|
| `auth.service.spec.ts` | 5 tests | validateUser, login, register |
| `workflows.service.spec.ts` | 4 tests | createInstance, transition |

### 8. Seed de données

| Entité | Quantité |
|--------|----------|
| Rôles | 6 (admin, soigneur, gestionnaire, rh, formateur, employe) |
| Permissions | 9 |
| Utilisateurs | 3 |
| Définitions workflow | 2 |
| Espèces | 5 |
| Enclos | 3 |
| Animaux | 4 |
| Couvées | 2 |
| Articles stock | 6 |
| Employés | 2 |
| Cours | 1 (avec chapitres et leçons) |

---

## Métriques du projet

| Métrique | Valeur |
|----------|--------|
| Fichiers source | 85 |
| Commits | 2 |
| Labels GitHub | 8 |
| Milestones GitHub | 4 |
| Issues backlog | 6 |
| Lignes de code estimées | ~4 500 |
| Technologies | TypeScript, NestJS, Next.js, Prisma, PostgreSQL, Tailwind, React Query, Zustand |

---

## Backlog Phase 2 (Issues GitHub ouvertes)

| # | Titre | Priorité |
|---|-------|----------|
| #5 | feat(frontend): Modals de création/édition pour tous les plugins | Haute |
| #6 | feat(workflow): Page de détail d'instance avec boutons de transition | Haute |
| #7 | feat(dashboard): Graphiques Recharts | Moyenne |
| #8 | feat(notifications): Notifications temps réel via WebSocket | Moyenne |
| #9 | feat(export): Export CSV/PDF des rapports | Moyenne |
| #10 | infra(ci): Pipeline GitHub Actions | Basse |

---

## Commandes de démarrage

```bash
# Développement
docker-compose -f docker-compose.dev.yml up -d
pnpm install
pnpm --filter @lftg/core prisma:generate
pnpm --filter @lftg/core prisma:migrate
pnpm --filter @lftg/core prisma:seed
pnpm dev

# Production
docker-compose up --build -d
```

---

*Rapport généré automatiquement par Manus — LFTG Platform v1.0.0*  
*Signé : William MERI*
