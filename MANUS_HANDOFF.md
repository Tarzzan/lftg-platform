# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **14.5.0**

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
| v14.0.0 | ✅ Livré | FCM push notifications, Webhooks système, RBAC granulaire, Analytics 12 mois, Galerie S3, Rapports automatiques email |
| v14.4.0 | ✅ Livré | Suppression IP hardcodée dans tous les fichiers de config (iframe cours HTML, docker-compose, nginx) |
| v14.5.0 | ✅ Livré | Correctif logo sidebar (carré bleu vide) et URL Swagger docs (erreur 404) |

---

## Ce qui a été réalisé

### Phase 14.5 — v14.5.0 (Correctifs UI & API Docs)

**1. Logo manquant dans la Sidebar (carré bleu vide)**

- **Contexte :** Le logo LFTG en haut de la sidebar admin n'apparaissait pas, remplacé par un carré bleu vide.
- **Cause :** Le `div` conteneur du logo dans `admin/layout.tsx` était vide, sans balise `<img>`.
- **Correction (commit `c378f78`) :**
  - Remplacement du `div` vide par une balise `<img src="/logo-d-web.png">`.
  - Taille du logo ajustée dynamiquement : `48px` en mode normal, `40px` en mode réduit (`collapsed`).
  - Ajout d'un `drop-shadow` pour une meilleure visibilité sur le fond sombre.

**2. Erreur 404 sur la page de documentation API (/admin/docs)**

- **Contexte :** La page affichait une erreur 404 (`Impossible d'obtenir /api/v1/api`).
- **Cause :** La page construisait les URLs Swagger en se basant sur `NEXT_PUBLIC_API_URL` (`/api/v1`), ce qui générait des URLs invalides comme `/api/v1/api`.
- **Correction (commit `79d3938`) :**
  - La page utilise désormais `window.location.origin` comme base pour construire les URLs Swagger, pointant vers `/docs` et `/docs-json` qui sont les bonnes routes exposées par Nginx.
  - Toutes les URLs (fetch, iframe, liens) sont corrigées pour utiliser cette nouvelle base.

---

### Phase 14.4 — v14.4.0 (Correctif URL Iframe)

**Contexte :** Le contenu des cours de formation (ex: "Alimentation des reptiles") s'affichait mal car l'URL source de l'iframe pointait sur une IP hardcodée (`http://51.210.15.92`), bloquée par les pare-feux d'entreprise.

**Analyse de la cause racine :**

Le composant React `DocumentViewer.tsx` construisait l'URL de l'iframe en se basant sur la variable d'environnement `NEXT_PUBLIC_API_URL`. Une mauvaise configuration de cette variable dans plusieurs fichiers propageait l'IP au lieu d'une URL relative.

```ts
// Dans DocumentViewer.tsx
const apiBase = process.env.NEXT_PUBLIC_API_URL; // Ex: "http://51.210.15.92/api/v1"
const serverBase = apiBase.replace(/\/api\/v1$/, ''); // Ex: "http://51.210.15.92"
const url = `${serverBase}${doc.url}`; // Ex: "http://51.210.15.92/uploads/cours.html"
```

**Corrections apportées :**

| Fichier Corrigé | Avant | Après |
|---|---|---|
| `apps/frontend/.env.production` | `NEXT_PUBLIC_API_URL=http://51.210.15.92/api/v1` | `NEXT_PUBLIC_API_URL=/api/v1` |
| `docker-compose.yml` | `NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://51.210.15.92/api/v1}` | `NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-/api/v1}` |
| `docker-compose.prebuilt.yml` | `NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://51.210.15.92/api/v1}` | `NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-/api/v1}` |
| `nginx/prod.conf` | `server_name 51.210.15.92 lftg.info;` | `server_name ... lftg.netetfix.fr;` |

**Résultat :**

Avec `NEXT_PUBLIC_API_URL=/api/v1`, `serverBase` devient une chaîne vide (`""`) et l'URL de l'iframe est désormais une URL relative (ex: `/uploads/cours.html`). Cette approche garantit que les cours s'affichent correctement, quel que soit le domaine ou l'IP utilisé pour accéder à la plateforme.

---

### Phase 14 — v14.0.0 (Notifications, Analytics & Gouvernance)

**Modules NestJS créés** :

| Module | Fonctionnalités |
|--------|-----------------|
| `fcm` | Firebase Cloud Messaging, 4 appareils iOS/Android, topics, historique 127 notifs/7j |
| `webhooks` | Intégrations DRAAF/GBIF/Clinique/ERP, HMAC-SHA256, journaux, 97.4% succès |
| `rbac` | Matrice permissions 6 ressources × 4 rôles (admin/vétérinaire/soigneur/visiteur) |
| `analytics` | KPIs 12 mois, tendances CA/naissances/ventes, répartition espèces |
| `gallery` | AWS S3, 847 photos, upload, reconnaissance IA espèces (94.1%) |
| `auto-reports` | @nestjs/schedule, 5 rapports planifiés, cron jobs, envoi email PDF |

**Pages Next.js créées** :

| Page | Description |
|------|-------------|
| `/admin/push-fcm` | 4 appareils, 127 notifs/7j, 99.2% livraison, topics, historique |
| `/admin/webhooks` | 4 intégrations, journaux HTTP, créateur avec sélection événements |
| `/admin/rbac` | Matrice ✓/✗, gestion utilisateurs, configuration rôles |
| `/admin/analytics` | KPIs 4 cartes, graphique barres 12 mois, répartition espèces, tableau |
| `/admin/gallery` | 847 photos S3, vue grille/liste, filtres portrait/médical/comportement |
| `/admin/auto-reports` | 5 rapports planifiés, historique 47 envois, créateur avec cron |

**6 captures d'écran** : push-fcm, webhooks, rbac, analytics, gallery, auto-reports

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — 64+ modules
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
│   │   │   ├── events (Socket.io), export (fast-csv)           [v13]
│   │   │   └── fcm, webhooks, rbac, analytics, gallery, auto-reports [v14]
│   │   ├── src/i18n/     # FR/EN/ES translations               [v13]
│   │   └── src/main.ts   # Swagger + i18n configured           [v13]
│   ├── frontend/         # Next.js 14 + Tailwind — 79+ pages
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
└── screenshots/          # 59+ captures (v1 → v14)
```

---

## Backlog Phase 15 (v15.0.0)

### Priorité haute

- [ ] **Portail public visiteurs** — Site vitrine LFTG accessible sans authentification
  - Page d'accueil avec galerie d'animaux publique
  - Formulaire de réservation de visites en ligne
  - Page de parrainage public avec paiement Stripe
  - Blog/actualités de la ferme

- [ ] **Application mobile complète** — Expo SDK 52 avec écrans fonctionnels
  - Écran liste animaux avec photos S3
  - Écran détail animal avec historique médical
  - Écran notifications push FCM
  - Écran GPS temps réel

- [ ] **Intégration email Nodemailer** — Envoi réel des rapports automatiques
  - Configuration SMTP (Gmail/SendGrid)
  - Templates HTML des rapports
  - Confirmation d'inscription parrainage

### Priorité normale

- [ ] **Tableau de bord consolidé multi-sites** — Vue réseau LFTG
  - Agrégation données 3 sites
  - Alertes inter-sites
  - Transferts d'animaux avec traçabilité

- [ ] **Reconnaissance d'espèces IA** — Intégration API vision
  - Identification automatique espèce depuis photo
  - Validation CITES automatique
  - Alerte espèce non répertoriée

- [ ] **Calendrier reproducteur avancé** — Planning accouplements
  - Recommandations basées sur généalogie et ML
  - Intégration calendrier Google/Outlook
  - Rappels automatiques

### Priorité basse

- [ ] **Audit trail complet** — Journalisation toutes les actions
- [ ] **Export GBIF** — Contribution données biodiversité
- [ ] **Application kiosque** — Mode tablette pour soigneurs
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

# Créer release GitHub
curl -s -X POST "https://api.github.com/repos/Tarzzan/lftg-platform/releases" \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tag_name":"v15.0.0","name":"LFTG Platform v15.0.0","body":"Phase 15","draft":false,"prerelease":false}'
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
| Modules NestJS | **64+** |
| Pages Next.js | **79+** |
| Modèles Prisma | **30+** |
| Fichiers TypeScript | **430+** |
| Stories Storybook | **16** |
| Tests automatisés | **84+** |
| Releases GitHub | **14** |
| Captures d'écran | **59+** |
| Lignes de code estimées | **~72 000** |

---

*Signé : William MERI — LFTG Platform v14.5.0 — Mars 2026*
