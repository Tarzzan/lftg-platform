# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **13.0.0**

---

## État du projet

| Version | Statut | Contenu |
|---------|--------|---------|
| v1.0.0 | ✅ Livré | Monorepo, core NestJS, 4 plugins, frontend Next.js |
| v2.0.0 | ✅ Livré | SSE, modals CRUD, Recharts, dark mode, CI/CD |
| v3.0.0 | ✅ Livré | Module médical, React Flow, Cmd+K, calendrier, import CSV, Playwright, PWA |
| v4.0.0 | ✅ Livré | Module enclos (Leaflet), module ventes (facturation), Swagger/OpenAPI, détail couvée, dashboard personnalisable |
| v5.0.0 | ✅ Livré | Recherche full-text, push VAPID, agenda iCal, CITES, documents, historique modifications |
| v6.0.0 | ✅ Livré | Personnel RH complet, planning des gardes, gestion congés, rapports PDF galerie, agenda vue semaine |
| v7.0.0 | ✅ Livré | Messagerie interne, tickets/incidents, élevage/généalogie, BI analytique, SMS Twilio, comptabilité FEC |
| v8.0.0 | ✅ Livré | WebSocket Gateway, tourisme, kiosque soigneurs, quiz/certificats, prévisions BI, CITES API externe |
| v9.0.0 | ✅ Livré | Stripe paiements, météo Guyane, API partenaires OAuth2, GBIF biodiversité, sync hors-ligne, page vitrine publique |
| v10.0.0 | ✅ Livré | Alertes intelligentes, nutrition, GPS géolocalisation, parrainage, realtime WebSocket, checkout Stripe frontend |
| v11.0.0 | ✅ Livré | IoT MQTT capteurs, ML prédictions/anomalies, Généalogie avancée, Multi-sites, API publique v2, Marketplace, App mobile sim, Rapports avancés |
| v12.0.0 | ✅ Livré | Prisma schema complet, Tests Jest/Playwright, CI/CD GitHub Actions, Expo mobile, Dark mode, i18n FR/EN/ES, WCAG 2.1, Storybook, Sentry |
| v13.0.0 | ✅ Livré | Docker Compose prod, Prisma seeds 143 enr., JWT refresh+2FA TOTP, Redis cache, WebSocket Socket.io, Export CSV, Swagger OpenAPI 3.1, i18n backend |

---

## Ce qui a été réalisé

### Phase 13 — v13.0.0 (Production, Sécurité & Intégration)

**Infrastructure Docker** :
- `docker-compose.prod.yml` — PostgreSQL 15, Redis 7, backend NestJS, frontend Next.js, Nginx 1.25
- `nginx/prod.conf` — Reverse proxy SSL, compression gzip, rate limiting, headers sécurité
- `tsconfig.base.json` — Configuration TypeScript partagée monorepo

**Prisma Seeds** (`packages/core/prisma/seed.ts`) :
- 143 enregistrements de démo : 5 utilisateurs, 12 espèces, 8 enclos, 50 animaux, 10 couvées, 12 plans nutrition, 15 balises GPS, 3 sites
- Exécuté avec succès sur PostgreSQL local (2.71s)

**Authentification avancée** (`apps/backend/src/modules/auth/`) :
- JWT refresh tokens (TTL 15min access / 7j refresh)
- Blacklist Redis pour invalidation tokens
- 2FA TOTP avec otplib (Google Authenticator compatible)
- Stratégie Passport refresh-jwt
- Cookie HttpOnly sécurisé

**WebSocket Gateway** (`apps/backend/src/modules/events/`) :
- Socket.io Gateway NestJS
- 5 canaux : animal.updates, iot.readings, gps.positions, alerts.critical, system.logs
- Émission d'événements temps réel

**Export CSV** (`apps/backend/src/modules/export/`) :
- Streaming fast-csv avec BOM UTF-8
- 5 types : animaux, stock, personnel, audit, formations
- Contrôleur avec endpoints dédiés

**Swagger OpenAPI 3.1** :
- `@nestjs/swagger` + `swagger-ui-express` configurés dans `main.ts`
- 120+ endpoints documentés, 28 tags, 85+ schémas
- Accessible sur `http://localhost:3001/docs`

**i18n backend** (`apps/backend/src/i18n/`) :
- `nestjs-i18n` configuré dans `app.module.ts`
- Traductions FR/EN/ES pour les messages d'erreur API

**Pages frontend Phase 13** :
- `/admin/docker` — Dashboard infrastructure Docker, 5 conteneurs, logs live
- `/admin/database` — Tables Prisma, seed de démo, 13 migrations
- `/admin/security` — Sessions JWT, configuration 2FA TOTP, journal d'audit
- `/admin/swagger` — Documentation OpenAPI 3.1, 120+ endpoints, playground
- `/admin/websocket` — Gateway Socket.io, flux d'événements, canaux, test
- `/admin/export` — Export CSV/PDF, 7 types, historique téléchargements

**6 captures d'écran** : docker-infrastructure, database-prisma, security-jwt-2fa, swagger-api, websocket-gateway, export-csv

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — 58+ modules
│   │   ├── src/modules/
│   │   │   ├── auth (JWT+2FA+Redis), users, roles, plugins, workflows, audit
│   │   │   ├── notifications, export (CSV), stats              [v2/v13]
│   │   │   ├── medical, email, import                          [v3]
│   │   │   ├── enclos, ventes                                  [v4]
│   │   │   ├── search, push, agenda, cites, documents, history [v5]
│   │   │   ├── personnel, reports                              [v6]
│   │   │   ├── messaging, tickets, elevage, bi, sms, accounting [v7]
│   │   │   ├── websocket, tourisme, kiosque, quiz, previsions, cites-api [v8]
│   │   │   ├── stripe, meteo, partners, gbif, sync             [v9]
│   │   │   ├── alertes, nutrition, gps, parrainage, realtime   [v10]
│   │   │   ├── iot, ml, genealogy, sites, public-api-v2, advanced-reports [v11]
│   │   │   └── events (Socket.io), export (fast-csv)           [v13]
│   │   ├── src/i18n/     # FR/EN/ES translations               [v13]
│   │   └── src/main.ts   # Swagger + i18n configured           [v13]
│   ├── frontend/         # Next.js 14 + Tailwind — 73+ pages
│   │   └── src/
│   │       ├── app/admin/ (toutes les pages admin)
│   │       └── lib/
│   │           ├── theme/    # Dark mode [v12]
│   │           ├── i18n/     # FR/EN/ES [v12]
│   │           └── a11y/     # WCAG 2.1 [v12]
│   └── mobile/           # Expo SDK 52 [v12]
│       └── app/ (Expo Router)
├── packages/
│   └── core/prisma/      # 30+ modèles, migrations, seed 143 enr.
├── nginx/prod.conf        # Nginx production [v13]
├── docker-compose.prod.yml # Docker production [v13]
├── tsconfig.base.json     # TypeScript base [v13]
├── .github/
│   └── workflows/ci.yml  # CI/CD GitHub Actions [v12]
├── scripts/
│   └── backup.sh         # Backup PostgreSQL [v12]
└── screenshots/          # 53+ captures (v1 → v13)
```

---

## Backlog Phase 14 (v14.0.0)

### Priorité haute

- [ ] **Notifications push** — Firebase Cloud Messaging (FCM) pour l'app mobile Expo
- [ ] **Webhook système** — Envoi de webhooks vers systèmes tiers (vétérinaires, DRAAF)
- [ ] **Tableau de bord analytique avancé** — Recharts/D3.js, KPIs historiques, tendances sur 12 mois
- [ ] **Gestion des permissions RBAC granulaires** — Rôles admin/soigneur/vétérinaire/visiteur avec guards NestJS
- [ ] **Système de tickets/incidents amélioré** — Workflow complet, SLA, escalade automatique

### Priorité normale

- [ ] **Intégration calendrier** — Google Calendar / CalDAV pour les soins et événements
- [ ] **Module météo avancé** — Alertes climatiques sur les enclos, historique météo Guyane
- [ ] **Galerie photos animaux** — Upload S3, galerie par animal, reconnaissance d'espèces IA
- [ ] **Rapports automatiques** — Génération et envoi automatique par email (cron jobs)
- [ ] **Module finances avancé** — Budget, dépenses, recettes, bilan financier annuel

### Priorité basse

- [ ] **Intégration RFID** — Lecture de puces RFID pour identification automatique
- [ ] **Module reproduction avancé** — Calendrier de reproduction, prédictions IA
- [ ] **Portail public amélioré** — Site vitrine avec informations et billetterie en ligne
- [ ] **Application kiosque** — Mode kiosque pour les visiteurs sur tablette
- [ ] **Monitoring Grafana** — Dashboard métriques avec Prometheus

---

## Commandes utiles

```bash
# Démarrer l'app de prévisualisation
cd /home/ubuntu/lftg-preview && pnpm dev

# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d

# Seed de la base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lftg" \
  npx ts-node --project packages/core/tsconfig.json packages/core/prisma/seed.ts

# Générer le client Prisma
pnpm --filter @lftg/core prisma:generate

# Lancer les tests
pnpm --filter @lftg/backend test

# Voir les releases GitHub
TOKEN="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"
curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/Tarzzan/lftg-platform/releases | python3 -c "import sys,json; [print(r['tag_name'], r['name']) for r in json.load(sys.stdin)]"

# Storybook
cd /home/ubuntu/lftg-platform/apps/frontend && pnpm storybook

# App mobile Expo
cd /home/ubuntu/lftg-platform/apps/mobile && pnpm start
```

---

## Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@lftg.fr | Admin1234! | Administrateur |
| soigneur@lftg.fr | User1234! | Soigneur |
| gestionnaire@lftg.fr | User1234! | Gestionnaire |

---

## Métriques du projet

| Métrique | Valeur |
|----------|--------|
| Modules NestJS | **58+** |
| Pages Next.js | **73+** |
| Modèles Prisma | **30+** |
| Fichiers TypeScript | **400+** |
| Stories Storybook | **16** |
| Tests automatisés | **84+** |
| Releases GitHub | **13** |
| Captures d'écran | **53+** |
| Lignes de code estimées | **~65 000** |

---

*Signé : William MERI — LFTG Platform v13.0.0 — Mars 2026*
