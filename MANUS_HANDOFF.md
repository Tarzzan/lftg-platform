# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **10.0.0**

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

---

## Ce qui a été réalisé

### Phase 10 — v10.0.0 (Alertes, Nutrition, GPS & Parrainage)

**Backend — 5 nouveaux modules :**
- `alertes` — Alertes intelligentes (règles ML, seuils configurables, acquittement, résolution)
- `nutrition` — Plans alimentaires par espèce, calendrier repas, stock alimentaire, alertes
- `gps` — Balises GPS animaux, positions temps réel, géofencing, alertes hors-zone
- `parrainage` — Parrainages d'animaux, paiements récurrents Stripe, certificats, mises à jour
- `realtime` — Métriques live WebSocket, capteurs environnementaux, flux d'événements

**Frontend — 6 nouvelles pages :**
- `/admin/alertes` — Centre d'alertes avec filtres par sévérité, acquittement, règles
- `/admin/nutrition` — Plans alimentaires, calendrier du jour, stock alimentaire
- `/admin/gps` — Carte GPS temps réel, liste balises, gestion enclos
- `/admin/parrainage` — Liste parrains, animaux parrainés, statistiques revenus
- `/admin/realtime` — Dashboard temps réel WebSocket, KPIs live, capteurs, flux événements
- `/public/checkout` — Tunnel de paiement Stripe (visites, parrainages, dons)

**Captures d'écran Phase 10 :**
- `v10-alertes-intelligentes.webp`, `v10-nutrition.webp`, `v10-nutrition-calendrier.webp`
- `v10-gps-geolocalisation.webp`, `v10-gps-liste.webp`, `v10-parrainage.webp`
- `v10-realtime-dashboard.webp`, `v10-checkout-stripe.webp`

---

### Phase 9 — v9.0.0 (Commerce, Intégrations & Biodiversité)

**Backend — 5 nouveaux modules :**
- `stripe` — Paiements en ligne (checkout, webhooks, remboursements, virements)
- `meteo` — Météo Guyane via OpenWeatherMap (Cayenne, alertes cyclone/canicule, prévisions 7j)
- `partners` — API partenaires OAuth2 (clés API, quotas, logs d'accès, 24 endpoints exposés)
- `gbif` — GBIF biodiversité mondiale (occurrences, statuts UICN, carte Guyane)
- `sync` — Synchronisation hors-ligne (IndexedDB, queue différée, résolution de conflits)

**Frontend — 5 nouvelles pages :**
- `/public` — Page vitrine publique (hero, espèces CITES, visites, actualités, météo, footer)
- `/admin/stripe` — Stripe Paiements (KPIs, revenus 6 mois, méthodes de paiement, transactions)
- `/admin/meteo` — Météo Guyane (carte actuelle, prévisions horaires/7j, alertes Vigilance Orange)
- `/admin/partners` — API Partenaires (5 partenaires, 4 659 requêtes, documentation OAuth2)
- `/admin/gbif` — GBIF Biodiversité (5 espèces, 126 306 occurrences mondiales, tableau Guyane)

**Navigation enrichie :**
- Section "Paiements & Commerce" : Stripe + Météo
- Section "Intégrations" : API Partenaires + GBIF Biodiversité

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — 41 modules
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
│       └── alertes, nutrition, gps, parrainage, realtime [v10]
│   └── frontend/         # Next.js 14 + Tailwind — 55+ pages
│       └── src/app/
│           ├── public/                                   [v9]
│           └── admin/
│               ├── page.tsx (dashboard), users, roles, workflows
│               ├── personnel/ (employes, planning, conges)
│               ├── stock/, animaux/, medical/, formation/
│               ├── ventes/, cites/, documents/
│               ├── agenda/, reports/, history/
│               ├── elevage/, messaging/, tickets/
│               ├── bi/ (dashboard + previsions)
│               ├── tourisme/, kiosque/
│               ├── accounting/, docs/ (Swagger UI)
│               ├── stripe/, meteo/, partners/, gbif/     [v9]
│               ├── alertes/, nutrition/, gps/             [v10]
│               ├── parrainage/, realtime/                 [v10]
│               └── formation/quiz/
├── plugins/ (personnel, stock, animaux-couvees, formation)
├── packages/core/prisma/ (32 modèles, seed)
├── screenshots/ (25+ captures)
└── .github/workflows/ (ci.yml, release.yml)
```

---

## Backlog Phase 11 (v11.0.0)

### Priorité haute
- [ ] **Application mobile Expo** — React Native avec scan QR, alertes push natives, mode offline, partage de code
- [ ] **ML avancé** — Prédictions de reproduction, détection d'anomalies comportementales, recommandations nutritionnelles
- [ ] **IoT capteurs** — Intégration MQTT, capteurs température/humidité/CO2 temps réel, alertes automatiques
- [ ] **Généalogie avancée** — Arbre généalogique D3.js interactif, calcul consanguinité, recommandations accouplements

### Priorité normale
- [ ] **Multi-ferme** — Gestion plusieurs sites, transferts inter-sites, tableau de bord consolidé
- [ ] **API publique v2** — Swagger enrichi, webhooks, SDK client TypeScript
- [ ] **Rapports avancés** — Rapports CITES automatisés, bilan annuel, rapport vétérinaire
- [ ] **Marketplace** — Plateforme d'échange éleveurs, annonces, messagerie intégrée

### Priorité basse
- [ ] **Internationalisation complète** — EN/ES/PT, traductions automatiques, formats régionaux
- [ ] **Intégration ERP** — Connexion Sage/QuickBooks, exports comptables automatisés
- [ ] **Intégration IUCN Red List API** — Statuts conservation en temps réel
- [ ] **Rapports réglementaires automatiques** — DRAAF, DREAL Guyane
- [ ] **Intégration caméras IP** — Flux vidéo RTSP, alertes mouvement

---

## Commandes utiles

```bash
# Développement local
cp .env.example .env
docker-compose -f docker-compose.dev.yml up -d
pnpm install
pnpm --filter @lftg/core prisma:generate
pnpm --filter @lftg/core prisma:migrate
pnpm --filter @lftg/core prisma:seed
pnpm dev

# Tests
pnpm --filter @lftg/backend test
pnpm --filter @lftg/frontend test:e2e

# Release
git tag v10.0.0 && git push origin v10.0.0
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
| Modules NestJS | **50+** |
| Pages Next.js | **60+** |
| Modèles Prisma | **35+** |
| Fichiers TypeScript | **280+** |
| Suites E2E Playwright | **6** |
| Screenshots | **33+** |
| Releases GitHub | **10** |
| Lignes de code estimées | **~45 000** |

---

*Signé : William MERI — LFTG Platform v10.0.0 — Mars 2026*
