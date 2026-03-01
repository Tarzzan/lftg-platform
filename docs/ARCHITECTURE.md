# LFTG Platform - Architecture & Design

Ce document décrit l'architecture logicielle, le modèle de données (schéma Prisma) et les endpoints principaux de la LFTG Platform.

## 1. Architecture Globale : Monorepo & Domain-Driven Design

La plateforme est structurée en **monorepo** géré par `pnpm workspaces`. Cette approche centralise tout le code (backend, frontend, plugins, shared) et simplifie la gestion des dépendances, le typage et les déploiements.

L'architecture s'inspire du **Domain-Driven Design (DDD)**, avec une séparation claire entre le `core` (noyau agnostique) et les `plugins` (modules métier spécifiques).

### Structure du Monorepo

```
/lftg-platform
|-- /apps
|   |-- /backend          # API principale (NestJS)
|   |-- /frontend         # Interface utilisateur (Next.js)
|-- /packages
|   |-- /core             # Logique métier centrale, Prisma, Auth, Workflows
|   |-- /shared-types     # Types TypeScript partagés (DTOs, interfaces)
|   |-- /ui               # Design System (shadcn/ui, Tailwind)
|-- /plugins
|   |-- /personnel        # Plugin de gestion RH
|   |-- /stock            # Plugin de gestion de stock
|   |-- /animaux-couvees  # Plugin de suivi des animaux
|   |-- /formation        # Plugin LMS
|-- package.json
|-- pnpm-workspace.yaml
|-- tsconfig.json
|-- docker-compose.yml
```

## 2. Modèle de Données (Schéma Prisma)

Le modèle de données est défini de manière centralisée dans `/packages/core/prisma/schema.prisma`. Les plugins peuvent étendre ce schéma.

### 2.1 Modèles du Noyau (Core)

Ces modèles sont fondamentaux pour le fonctionnement de la plateforme.

```prisma
// /packages/core/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --- Modèles d'Authentification & Permissions ---

model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  email     String   @unique
  name      String?
  password  String   // Hashé
  isActive  Boolean  @default(true)

  roles     Role[]   @relation("UserRoles")
  teams     Team[]   @relation("TeamUsers")
  auditLogs AuditLog[]
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  users       User[]       @relation("UserRoles")
  permissions Permission[]
}

model Permission {
  id          String  @id @default(cuid())
  action      String  // e.g., 'create', 'read', 'update', 'delete', 'manage'
  subject     String  // e.g., 'Animal', 'User', 'all'
  conditions  Json?   // Conditions ABAC (e.g., { "isOwner": true })
  description String?
  roles       Role[]
}

model Team {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  users       User[] @relation("TeamUsers")
}

// --- Modèle d'Audit ---

model AuditLog {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // e.g., 'login', 'workflow:transition', 'plugin:enable'
  subject   String   // e.g., 'User:auth', 'WorkflowInstance:123', 'Plugin:stock'
  details   Json?    // Données contextuelles
}

// --- Modèles du Moteur de Workflows ---

model WorkflowDefinition {
  id           String   @id @default(cuid())
  name         String   @unique
  entityType   String   // e.g., 'StockRequest', 'HealthReport'
  states       Json     // Définition des états (ex: { "draft": { "type": "initial" }, "approved": { "type": "final" } })
  transitions  Json     // Définition des transitions (ex: { "submit": { "from": "draft", "to": "pending" } })
  formSchema   Json     // Schéma de formulaire global (Zod schema en JSON)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  instances WorkflowInstance[]
}

model WorkflowInstance {
  id           String   @id @default(cuid())
  definitionId String
  definition   WorkflowDefinition @relation(fields: [definitionId], references: [id])
  entityId     String   // ID de l'entité métier liée (ex: ID de la demande de stock)
  currentState String
  context      Json     // Données du formulaire et autres infos
  assigneeId   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  history WorkflowHistory[]
}

model WorkflowHistory {
  id         String   @id @default(cuid())
  instanceId String
  instance   WorkflowInstance @relation(fields: [instanceId], references: [id])
  timestamp  DateTime @default(now())
  fromState  String
  toState    String
  transition String
  userId     String
  notes      String?
  context    Json     // Snapshot du context de l'instance à ce moment
}

```

### 2.2 Modèles des Plugins (Exemples)

Chaque plugin peut définir ses propres modèles dans son dossier `prisma/`. Voici des exemples pour les plugins initiaux.

**Plugin `personnel`:**
```prisma
// /plugins/personnel/prisma/schema.prisma

model Employee {
  id          String    @id @default(cuid())
  userId      String    @unique // Lien vers le modèle User du core
  user        User      @relation(fields: [userId], references: [id])
  jobTitle    String?
  hireDate    DateTime?
  documents   Document[]
  skills      Skill[]   @relation("EmployeeSkills")
}

model Skill {
  id        String     @id @default(cuid())
  name      String     @unique
  employees Employee[] @relation("EmployeeSkills")
}

model Document {
  id         String   @id @default(cuid())
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id])
  name       String
  url        String
  type       String   // e.g., 'contract', 'id_card'
  uploadedAt DateTime @default(now())
}
```

**Plugin `stock`:**
```prisma
// /plugins/stock/prisma/schema.prisma

model StockItem {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  quantity    Int       @default(0)
  unit        String    // e.g., 'kg', 'unit', 'liter'
  lowStockThreshold Int @default(0)
}

model StockMovement {
  id        String   @id @default(cuid())
  itemId    String
  item      StockItem @relation(fields: [itemId], references: [id])
  quantity  Int      // Positif pour entrée, négatif pour sortie
  type      String   // e.g., 'initial', 'purchase', 'withdrawal', 'correction'
  userId    String
  timestamp DateTime @default(now())
  notes     String?
}
```

**Plugin `animaux-couvees`:**
```prisma
// /plugins/animaux-couvees/prisma/schema.prisma

model Species {
  id   String @id @default(cuid())
  name String @unique
  scientificName String?
  animals Animal[]
}

model Enclosure {
  id      String @id @default(cuid())
  name    String @unique
  animals Animal[]
}

model Animal {
  id          String    @id @default(cuid())
  identifier  String    @unique
  speciesId   String
  species     Species   @relation(fields: [speciesId], references: [id])
  enclosureId String?
  enclosure   Enclosure? @relation(fields: [enclosureId], references: [id])
  birthDate   DateTime?
  sex         String?   // 'male', 'female', 'unknown'
  events      AnimalEvent[]
}

model AnimalEvent {
  id        String   @id @default(cuid())
  animalId  String
  animal    Animal   @relation(fields: [animalId], references: [id])
  timestamp DateTime @default(now())
  type      String   // 'health_check', 'observation', 'treatment', 'death'
  notes     String?
  userId    String
}

model Brood {
  id              String   @id @default(cuid())
  speciesId       String
  incubationStartDate DateTime
  hatchDate       DateTime?
  eggCount        Int
  notes           String?
}
```

## 3. Endpoints Principaux de l'API (NestJS)

L'API est exposée via le backend NestJS. Les endpoints sont versionnés (`/api/v1/...`) et sécurisés par des guards (authentification, permissions RBAC/ABAC).

### 3.1 Core API

**Auth (`/api/v1/auth`)**
- `POST /login` : Connexion, retourne un JWT.
- `POST /register` : Inscription d'un nouvel utilisateur.
- `GET /me` : Récupère le profil de l'utilisateur connecté.

**Users (`/api/v1/users`)**
- `GET /` : Liste tous les utilisateurs (admin).
- `POST /` : Crée un utilisateur (admin).
- `GET /:id` : Récupère un utilisateur.
- `PATCH /:id` : Met à jour un utilisateur.
- `DELETE /:id` : Désactive un utilisateur (admin).

**Roles & Permissions (`/api/v1/roles`)**
- `GET /` : Liste tous les rôles.
- `POST /` : Crée un rôle (admin).
- `GET /:id` : Récupère un rôle et ses permissions.
- `POST /:id/permissions` : Associe des permissions à un rôle (admin).

### 3.2 Workflow Engine API

**Workflow Definitions (`/api/v1/workflows/definitions`)**
- `GET /` : Liste toutes les définitions de workflows.
- `POST /` : Crée une nouvelle définition (designer admin).
- `GET /:id` : Récupère une définition.
- `PUT /:id` : Met à jour une définition (designer admin).

**Workflow Instances (`/api/v1/workflows/instances`)**
- `GET /` : Liste les instances de workflow (avec filtres : `status`, `assignee`, etc.).
- `GET /:id` : Récupère une instance, son contexte et son historique.
- `POST /:id/transition` : Déclenche une transition d'état (ex: `{ "transition": "approve" }`).

### 3.3 Plugin API (Exemple: `stock`)

Chaque plugin expose ses propres endpoints sous un namespace dédié.

**Stock Items (`/api/v1/plugins/stock/items`)**
- `GET /` : Liste les articles en stock.
- `POST /` : Crée un nouvel article.
- `GET /:id` : Récupère un article.
- `PATCH /:id` : Met à jour un article.

**Stock Movements (`/api/v1/plugins/stock/movements`)**
- `GET /` : Liste les mouvements de stock.
- `POST /` : Enregistre un nouveau mouvement (entrée/sortie/correction).

**Stock Requests (Workflow) (`/api/v1/plugins/stock/requests`)**
- `POST /` : Crée une nouvelle demande de sortie de stock (démarre une instance de workflow).
- `GET /` : Liste les demandes de sortie en cours.
- `GET /:id` : Récupère le détail d'une demande.
