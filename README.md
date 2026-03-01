<div align="center">

# 🦜 LFTG Platform

**La Ferme Tropicale de Guyane — Plateforme de gestion intégrée**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220?style=flat-square&logo=pnpm)](https://pnpm.io/)

*Plateforme modulaire de gestion pour la ferme tropicale : animaux, stock, personnel et formation*

</div>

---

## Vue d'ensemble

La **LFTG Platform** est une application web complète conçue pour centraliser et automatiser la gestion opérationnelle de La Ferme Tropicale de Guyane. Elle repose sur une architecture **monorepo** avec un backend NestJS, un frontend Next.js et un système de **plugins métier** extensibles.

### Fonctionnalités principales

| Domaine | Description |
|---------|-------------|
| **Auth & RBAC/ABAC** | Authentification JWT, rôles granulaires, permissions par action/sujet |
| **Workflow Engine** | Moteur de workflows configurable avec états, transitions, historique et événements |
| **Plugin Registry** | Système de plugins auto-enregistrables avec manifests, menus et permissions |
| **Audit Log** | Journal d'audit complet de toutes les actions |
| **Plugin Personnel** | Gestion RH : employés, compétences, documents |
| **Plugin Stock** | Gestion de stock : articles, mouvements, alertes, demandes en workflow |
| **Plugin Animaux & Couvées** | Suivi des espèces, enclos, animaux, événements santé et incubation |
| **Plugin Formation (LMS)** | Cours, chapitres, leçons, quiz, cohortes et suivi de progression |

---

## Architecture

```
lftg-platform/
├── apps/
│   ├── backend/          # API NestJS (port 3001)
│   └── frontend/         # Interface Next.js (port 3000)
├── packages/
│   ├── core/             # Prisma schema, seed, types partagés
│   └── shared-types/     # DTOs et interfaces TypeScript
├── plugins/
│   ├── personnel/        # Plugin RH
│   ├── stock/            # Plugin Stock
│   ├── animaux-couvees/  # Plugin Animaux & Couvées
│   └── formation/        # Plugin LMS
├── docs/                 # Documentation technique
├── docker-compose.yml    # Production
└── docker-compose.dev.yml # Développement
```

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Tarzzan/lftg-platform.git
cd lftg-platform

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env selon votre configuration
```

### Développement local

```bash
# 1. Démarrer la base de données
docker-compose -f docker-compose.dev.yml up -d

# 2. Générer le client Prisma
pnpm --filter @lftg/core prisma:generate

# 3. Appliquer les migrations
pnpm --filter @lftg/core prisma:migrate

# 4. Seeder la base de données
pnpm --filter @lftg/core prisma:seed

# 5. Démarrer l'application
pnpm dev
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api/v1
- **Swagger** : http://localhost:3001/api/docs

### Production (Docker)

```bash
docker-compose up --build -d
```

---

## Comptes de test

Après le seed, les comptes suivants sont disponibles :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@lftg.fr | Admin1234! | Administrateur |
| soigneur@lftg.fr | User1234! | Soigneur animalier |
| gestionnaire@lftg.fr | User1234! | Gestionnaire de stock |

---

## Design System

La plateforme utilise un design system inspiré de la **biodiversité guyanaise** :

| Palette | Usage | Couleur |
|---------|-------|---------|
| `forest` | Primaire, actions, succès | Vert forêt tropicale |
| `laterite` | Secondaire, alertes | Terre rouge / latérite |
| `maroni` | Accent, liens | Bleu fleuve Maroni |
| `gold` | Avertissements, couvées | Or / orpaillage |
| `wood` | Neutres, textes | Bois / terre |

---

## API Documentation

La documentation Swagger complète est disponible à l'adresse `/api/docs` lorsque le backend est en cours d'exécution.

### Endpoints principaux

| Groupe | Base URL |
|--------|----------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Roles | `/api/v1/roles` |
| Workflows | `/api/v1/workflows` |
| Audit | `/api/v1/audit` |
| Plugin Stock | `/api/v1/plugins/stock` |
| Plugin Animaux | `/api/v1/plugins/animaux` |
| Plugin Personnel | `/api/v1/plugins/personnel` |
| Plugin Formation | `/api/v1/plugins/formation` |

---

## Tests

```bash
# Tests unitaires
pnpm --filter backend test

# Tests avec couverture
pnpm --filter backend test --coverage
```

---

## Contribuer

Ce projet est géré par **William MERI**. Pour contribuer, créez une branche depuis `main` et soumettez une Pull Request.

---

<div align="center">
  <sub>Développé avec ❤️ pour La Ferme Tropicale de Guyane</sub><br>
  <sub>© 2026 William MERI — LFTG Platform v1.0.0</sub>
</div>
