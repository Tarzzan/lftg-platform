# LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> Auteur : William MERI  
> Date : Mars 2026  
> Version : 1.0.0

---

## État du projet

La **Phase 1** du projet LFTG Platform est complète. L'ensemble du code source est versionné sur GitHub : `Tarzzan/lftg-platform`.

---

## Ce qui a été réalisé

### Infrastructure & Architecture
- Monorepo `pnpm workspaces` avec la structure `apps/`, `packages/`, `plugins/`
- Schéma Prisma unifié avec tous les modèles (core + 4 plugins)
- Docker-compose pour la production et le développement local
- Fichier `.env.example` documenté

### Backend (NestJS — `apps/backend`)
- **Auth** : JWT + Passport (local + jwt strategies), register/login/me
- **RBAC/ABAC** : `PermissionsGuard` avec vérification dynamique des permissions en base
- **Workflow Engine** : `WorkflowsService` avec définitions, instances, transitions, historique et événements
- **Audit Log** : `AuditService` avec listener `@OnEvent('workflow.transitioned')`
- **Plugin Registry** : `PluginRegistryService` avec manifests, menu entries, permissions
- **Modules** : `PrismaModule` (global), `AuthModule`, `UsersModule`, `RolesModule`, `AuditModule`, `WorkflowsModule`, `PluginsModule`

### Plugins Métier
| Plugin | Fonctionnalités |
|--------|----------------|
| `plugin-personnel` | Employés, compétences, documents RH |
| `plugin-stock` | Articles, mouvements, alertes stock faible, demandes workflow |
| `plugin-animaux-couvees` | Espèces, enclos, animaux, événements santé, couvées/incubation |
| `plugin-formation` | Cours, chapitres, leçons, quiz, cohortes, inscriptions, progression |

### Frontend (Next.js — `apps/frontend`)
- **Design System Guyane** : Tailwind avec palette `forest`, `laterite`, `maroni`, `gold`, `wood`
- **Pages** : Login, Dashboard, Users, Stock Articles, Animaux (liste + couvées), Workflows, Audit, Formation
- **Layout Admin** : Sidebar avec navigation groupée, breadcrumb, user footer
- **API Client** : Axios avec injection automatique du JWT
- **State** : Zustand (auth store), React Query (data fetching)

### Tests
- `auth.service.spec.ts` : Tests unitaires pour validateUser, login, register
- `workflows.service.spec.ts` : Tests unitaires pour createInstance, transition

### Seed
- 3 utilisateurs (admin, soigneur, gestionnaire) avec rôles et permissions
- 6 rôles (admin, soigneur, gestionnaire, rh, formateur, employe)
- 2 définitions de workflows (stock, sanitaire)
- 5 espèces, 3 enclos, 4 animaux, 2 couvées
- 6 articles de stock, 2 employés avec compétences
- 1 cours de formation publié avec chapitres et leçons

---

## Backlog (Phase 2)

### Priorité haute
- [ ] Implémentation des formulaires de création/édition dans le frontend (modals)
- [ ] Page de détail d'une instance de workflow avec boutons de transition
- [ ] Upload de documents RH (S3 ou stockage local)
- [ ] Notifications en temps réel (WebSocket ou SSE) pour les workflows
- [ ] Dashboard avec graphiques Recharts (évolution stock, animaux par espèce)

### Priorité moyenne
- [ ] Gestion des cohortes et inscriptions dans le frontend
- [ ] Vue "Mes formations" avec progression par leçon
- [ ] Export CSV/PDF des rapports (audit, stock, animaux)
- [ ] Filtres avancés sur toutes les listes
- [ ] Mode sombre (dark mode toggle)

### Priorité basse
- [ ] Application mobile (Expo React Native)
- [ ] Intégration calendrier pour les événements animaliers
- [ ] API publique pour partenaires (rate limiting, API keys)
- [ ] CI/CD GitHub Actions (lint, test, build, deploy)
- [ ] Monitoring (Sentry, Prometheus)

---

## Commandes utiles

```bash
# Démarrer la base de données en développement
docker-compose -f docker-compose.dev.yml up -d

# Générer le client Prisma
pnpm --filter @lftg/core prisma:generate

# Appliquer les migrations
pnpm --filter @lftg/core prisma:migrate

# Seeder la base
pnpm --filter @lftg/core prisma:seed

# Démarrer le backend en dev
pnpm --filter backend dev

# Démarrer le frontend en dev
pnpm --filter frontend dev

# Lancer les tests
pnpm --filter backend test

# Build de production
docker-compose up --build
```

---

## Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@lftg.fr | Admin1234! | admin |
| soigneur@lftg.fr | User1234! | soigneur |
| gestionnaire@lftg.fr | User1234! | gestionnaire |

---

*Signé : William MERI — LFTG Platform v1.0.0*
