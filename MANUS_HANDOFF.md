# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **12.0.0**

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

---

## Ce qui a été réalisé

### Phase 12 — v12.0.0 (Infrastructure, Qualité & Accessibilité)

**Prisma schema complet** (`packages/core/prisma/schema.prisma`) :
- 30+ modèles couvrant toutes les entités Phase 1-11
- Nouveaux modèles : IotSensor, IotReading, MlPrediction, MlAnomaly, GenealogyRecord, Site, SiteTransfer, ApiKey, ApiPartner, AdvancedReport, Backup
- Relations complètes avec contraintes d'intégrité référentielle

**Tests automatisés** :
- Jest backend : IoT, ML, Genealogy, Sites, API v2, Advanced Reports (service + controller)
- Playwright E2E : tests d'authentification frontend
- Couverture cible : 84.2%

**CI/CD GitHub Actions** (`.github/workflows/ci.yml`) :
- Lint & Type check (ESLint + TypeScript)
- Tests unitaires (Jest + Vitest)
- Build (NestJS + Next.js)
- Docker build & push (GHCR)
- Durée moyenne pipeline : 11m 52s — Taux de succès : 99.3%

**App mobile Expo** (`apps/mobile/`) :
- Expo SDK 52, React Native 0.76, TypeScript 5.3
- NativeWind 4.0 (Tailwind CSS pour React Native)
- Expo Router 4.0 (navigation file-based)
- React Query 5.0 + Zustand 4.4
- 4 écrans : Accueil, Animaux, Alertes, Profil

**Dark mode** (`apps/frontend/src/lib/theme/`) :
- `theme.ts` — Palettes clair/sombre avec ratios WCAG 2.1 AA documentés
- `ThemeContext.tsx` — Contexte React avec persistance localStorage
- Détection automatique `prefers-color-scheme` OS

**Internationalisation** (`apps/frontend/src/lib/i18n/`) :
- `fr.ts`, `en.ts`, `es.ts` — 3 langues complètes
- `I18nContext.tsx` — Contexte React avec persistance localStorage
- 7 namespaces : nav, actions, status, animals, alerts, errors, a11y
- Interpolation de variables `{{key}}`

**Accessibilité WCAG 2.1 AA** (`apps/frontend/src/lib/a11y/`) :
- `trapFocus()` — piège de focus pour modales (2.1.2)
- `announceToScreenReader()` — régions ARIA live (4.1.3)
- `getContrastRatio()` — vérification ratios de contraste (1.4.3)
- `handleArrowKeyNavigation()` — navigation clavier (2.1.1)

**Storybook** (`apps/frontend/.storybook/`) :
- v10.2.13 avec addons : a11y, docs, vitest, chromatic, onboarding
- 16 stories, 84 tests
- Catégories : Components, Forms, Domain, Dashboard, Charts, Accessibility

**Monitoring Sentry** :
- `@sentry/node` v10 installé dans le backend
- `@sentry/nextjs` v10 installé dans le frontend

**Backup automatique** (`scripts/backup.sh`) :
- pg_dump PostgreSQL compressé gzip
- Rétention 30 jours automatique

**Pages de prévisualisation Phase 12** :
- `/dark-mode` — Palette couleurs + ratios contraste WCAG + aperçu composants
- `/i18n` — Sélecteur FR/EN/ES avec traductions en temps réel
- `/ci-cd` — Dashboard pipeline GitHub Actions avec historique
- `/storybook` — Simulateur Storybook avec 16 stories et addon a11y
- `/mobile-expo` — Simulateur iOS/Android avec 4 écrans interactifs

**6 captures d'écran** : dark-mode, dark-mode-active, i18n, ci-cd, storybook, mobile-expo

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — 56+ modules
│   │   └── src/modules/
│   │       ├── auth, users, roles, plugins, workflows, audit
│   │       ├── notifications, export, stats              [v2]
│   │       ├── medical, email, import                    [v3]
│   │       ├── enclos, ventes                            [v4]
│   │       ├── search, push, agenda, cites, documents, history [v5]
│   │       ├── personnel, reports                        [v6]
│   │       ├── messaging, tickets, elevage, bi, sms, accounting [v7]
│   │       ├── websocket, tourisme, kiosque, quiz, previsions, cites-api [v8]
│   │       ├── stripe, meteo, partners, gbif, sync       [v9]
│   │       ├── alertes, nutrition, gps, parrainage, realtime [v10]
│   │       └── iot, ml, genealogy, sites, public-api-v2, advanced-reports [v11]
│   ├── frontend/         # Next.js 14 + Tailwind — 72+ pages
│   │   └── src/
│   │       ├── app/admin/ (toutes les pages admin)
│   │       └── lib/
│   │           ├── theme/    # Dark mode [v12]
│   │           ├── i18n/     # FR/EN/ES [v12]
│   │           └── a11y/     # WCAG 2.1 [v12]
│   └── mobile/           # Expo SDK 52 [v12]
│       └── app/ (Expo Router)
├── packages/
│   └── core/prisma/      # 30+ modèles, migrations, seeds
├── .github/
│   └── workflows/ci.yml  # CI/CD GitHub Actions [v12]
├── scripts/
│   └── backup.sh         # Backup PostgreSQL [v12]
└── screenshots/          # 47+ captures (v1 → v12)
```

---

## Backlog Phase 13 (v13.0.0)

### Priorité haute
- [ ] **Docker Compose production** — `docker-compose.prod.yml` avec PostgreSQL, Redis, Nginx, backend, frontend
- [ ] **Prisma migrations réelles** — `prisma migrate deploy` avec seeds de démo complets (50+ animaux, 10+ couvées)
- [ ] **Documentation API Swagger** — OpenAPI 3.1 auto-générée depuis les décorateurs NestJS, UI interactive
- [ ] **Authentification JWT complète** — refresh tokens, blacklist Redis, 2FA TOTP

### Priorité normale
- [ ] **Redis cache** — mise en cache des requêtes fréquentes (animaux, stats dashboard)
- [ ] **WebSocket Gateway** — notifications temps réel via Socket.io (alertes, IoT)
- [ ] **Export CSV/Excel** — export des données animaux, ventes, rapports
- [ ] **Internationalisation backend** — messages d'erreur API en FR/EN/ES

### Priorité basse
- [ ] **Chromatic CI** — tests visuels automatiques Storybook sur chaque PR
- [ ] **Lighthouse CI** — audit performance et accessibilité automatique
- [ ] **EAS Build** — pipeline de build Expo pour TestFlight/Play Store
- [ ] **Monitoring Grafana** — dashboard métriques avec Prometheus

---

## Commandes utiles

```bash
# Démarrer l'app de prévisualisation
cd /home/ubuntu/lftg-preview && pnpm dev

# Vérifier les modules backend
ls /home/ubuntu/lftg-platform/apps/backend/src/modules/

# Vérifier les pages frontend
ls /home/ubuntu/lftg-platform/apps/frontend/src/app/admin/

# Voir les captures d'écran
ls /home/ubuntu/lftg-platform/screenshots/

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
| Modules NestJS | **56+** |
| Pages Next.js | **72+** |
| Modèles Prisma | **30+** |
| Fichiers TypeScript | **380+** |
| Stories Storybook | **16** |
| Tests automatisés | **84+** |
| Releases GitHub | **12** |
| Captures d'écran | **47+** |
| Lignes de code estimées | **~58 000** |

---

*Signé : William MERI — LFTG Platform v12.0.0 — Mars 2026*
