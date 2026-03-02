<div align="center">

# 🦜 LFTG Platform v15.0.0

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
|---|---|
| **Auth & RBAC** | Authentification JWT, rôles granulaires, permissions par action/sujet |
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
│   └── core/             # Prisma schema, seed, types partagés
├── plugins/
│   ├── personnel/        # Plugin RH
│   ├── stock/            # Plugin Stock
│   ├── animaux-couvees/  # Plugin Animaux & Couvées
│   └── formation/        # Plugin LMS
├── docker-compose.yml    # Développement & Production
└── docker-compose.prod.yml # Production avec Nginx
```

---

## Démarrage rapide (Docker Recommandé)

### Prérequis

- **Docker & Docker Compose** (méthode recommandée)
- Ou : Node.js 20+, pnpm 9+

### Installation & Lancement (Docker)

Cette méthode est la plus simple et la plus fiable pour lancer le projet.

```bash
# 1. Cloner le dépôt
git clone https://github.com/Tarzzan/lftg-platform.git
cd lftg-platform

# 2. Configurer l'environnement
cp .env.example .env
# (Optionnel) Éditer .env si vous utilisez des ports différents

# 3. Lancer les conteneurs
docker-compose up --build -d
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Swagger** : http://localhost:3001/docs

La base de données sera automatiquement migrée et seedée au premier démarrage du conteneur `backend`.

### Installation locale (alternative)

```bash
# 1. Installer les dépendances
pnpm install

# 2. Démarrer la base de données et Redis
docker-compose up -d db redis

# 3. Appliquer les migrations et le seed
pnpm prisma:migrate
pnpm prisma:seed

# 4. Démarrer l'application en mode dev
pnpm dev
```

---

## Déploiement en Production

Le fichier `docker-compose.prod.yml` est configuré pour un déploiement en production avec un reverse proxy Nginx.

```bash
# Assurez-vous que votre .env est configuré pour la production
# (notamment JWT_SECRET et les URLs publiques)

docker-compose -f docker-compose.prod.yml up --build -d
```

Le site sera accessible sur `http://localhost` (port 80).

---

## Comptes de test

Après le seed, les comptes suivants sont disponibles :

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@lftg.fr` | `Admin1234!` | Administrateur |
| `soigneur@lftg.fr` | `User1234!` | Soigneur animalier |
| `gestionnaire@lftg.fr` | `User1234!` | Gestionnaire de stock |

---

## Scripts PNPM

- `pnpm dev`: Lance le frontend et le backend en mode watch.
- `pnpm build`: Build les applications pour la production.
- `pnpm prisma:migrate`: Applique les migrations Prisma.
- `pnpm prisma:seed`: Exécute le script de seed.
- `pnpm prisma:studio`: Ouvre Prisma Studio pour explorer la base de données.
- `pnpm test`: Lance les tests unitaires du backend.

---

## Contribuer

Ce projet est géré par **William MERI**. Pour contribuer, créez une branche depuis `main` et soumettez une Pull Request.

---

<div align="center">
  <sub>Développé avec ❤️ pour La Ferme Tropicale de Guyane</sub><br>
  <sub>© 2026 William MERI — LFTG Platform v15.0.0</sub>
</div>
