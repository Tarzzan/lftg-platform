# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **9.0.0**

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

---

## Ce qui a été réalisé

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
│   │       └── stripe, meteo, partners, gbif, sync       [v9]
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
│               └── formation/quiz/
├── plugins/ (personnel, stock, animaux-couvees, formation)
├── packages/core/prisma/ (32 modèles, seed)
├── screenshots/ (25+ captures)
└── .github/workflows/ (ci.yml, release.yml)
```

---

## Backlog Phase 10 (v10.0.0)

### Priorité haute
- [ ] **Application mobile Expo** — React Native avec scan QR, alertes push, soins rapides
- [ ] **Checkout Stripe frontend** — Page de paiement en ligne pour les ventes et visites
- [ ] **Module alertes intelligentes** — Seuils stock, santé animaux, alertes météo
- [ ] **Tableau de bord temps réel WebSocket** — Métriques live (animaux, stock, ventes)

### Priorité normale
- [ ] **Module nutrition** — Rations, régimes alimentaires par espèce, suivi consommation
- [ ] **Géolocalisation GPS** — Suivi animaux en liberté surveillée (carte temps réel)
- [ ] **Intégration iNaturalist** — Observations terrain, photos communautaires
- [ ] **Module parrainage** — Adoptez un animal (page publique + paiement récurrent)
- [ ] **Internationalisation i18n** — fr/en/es/pt

### Priorité basse
- [ ] **Application TV/kiosque public** — Affichage en salle d'attente (espèces, météo)
- [ ] **Intégration IUCN Red List API** — Statuts conservation en temps réel
- [ ] **Module génétique avancé** — Analyse ADN, marqueurs microsatellites
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
| Modules NestJS | **41** |
| Pages Next.js | **55+** |
| Modèles Prisma | **32** |
| Fichiers TypeScript | **265+** |
| Suites E2E Playwright | **6** |
| Screenshots | **25+** |
| Releases GitHub | **9** |
| Lignes de code estimées | **~38 000** |

---

*Signé : William MERI — LFTG Platform v9.0.0 — Mars 2026*
