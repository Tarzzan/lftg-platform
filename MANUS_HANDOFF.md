# 🦜 LFTG Platform — Fichier de Passation (MANUS_HANDOFF)

> **Auteur :** William MERI  
> **Date :** Mars 2026  
> **Version :** **8.0.0**

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

---

## Ce qui a été réalisé

### Phase 8 — v8.0.0 (Temps réel, Tourisme & Intelligence)

**Backend — 6 nouveaux modules :**
- `websocket` — WebSocket Gateway Socket.io (messagerie live, rooms, présence, typing indicators)
- `tourisme` — Visites guidées, réservations, groupes scolaires, statistiques de fréquentation
- `kiosque` — Mode kiosque soigneurs (tâches du jour, scan QR, alertes, progression)
- `quiz` — Quiz interactifs (chronomètre, explications, certificats PDF avec QR code)
- `previsions` — Prévisions BI par régression linéaire (revenus, population, stock, tourisme)
- `cites-api` — Intégration API externe checklist.cites.org (vérification automatique des espèces)

**Frontend — 4 nouvelles pages :**
- `/admin/tourisme` — Visites guidées (6 KPIs, liste avec taux de remplissage, filtres par type)
- `/admin/kiosque` — Mode kiosque soigneurs (header vert, tâches colorées par priorité, barre de progression)
- `/admin/formation/quiz` — Quiz & Évaluations (certificats PDF, 3 quiz avec seuils et tentatives)
- `/admin/bi/previsions` — Prévisions & Analyses (4 onglets, régression linéaire SVG, R²=0.97)

**Navigation enrichie :**
- Section "Formation" : ajout "Quiz & Évaluations"
- Section "Tourisme & Kiosque" : Visites guidées + Mode Kiosque
- Section "Analytique" : ajout "Prévisions"

---

## Architecture du projet

```
lftg-platform/
├── apps/
│   ├── backend/          # NestJS 10 — 36 modules
│   │   └── src/modules/
│   │       ├── auth, users, roles, plugins, workflows, audit
│   │       ├── notifications, export, stats              [v2]
│   │       ├── medical, email, import                    [v3]
│   │       ├── enclos, ventes                            [v4]
│   │       ├── search, push, agenda, cites, documents, history [v5]
│   │       ├── personnel, reports                        [v6]
│   │       ├── messaging, tickets, elevage, bi, sms, accounting [v7]
│   │       └── websocket, tourisme, kiosque, quiz, previsions, cites-api [v8]
│   └── frontend/         # Next.js 14 + Tailwind — 50+ pages
│       └── src/app/admin/
│           ├── page.tsx (dashboard), users, roles, workflows
│           ├── personnel/ (employes, planning, conges)
│           ├── stock/, animaux/, medical/, formation/
│           ├── ventes/, cites/, documents/
│           ├── agenda/, reports/, history/
│           ├── elevage/, messaging/, tickets/
│           ├── bi/ (dashboard + previsions)              [v8]
│           ├── tourisme/, kiosque/                       [v8]
│           ├── accounting/, docs/ (Swagger UI)
│           └── formation/quiz/                           [v8]
├── plugins/ (personnel, stock, animaux-couvees, formation)
├── packages/core/prisma/ (32 modèles, seed)
├── screenshots/ (20+ captures)
└── .github/workflows/ (ci.yml, release.yml)
```

---

## Backlog Phase 9 (v9.0.0)

### Priorité haute
- [ ] **Application mobile Expo** — React Native avec scan QR, alertes push, soins rapides
- [ ] **Notifications push côté client** — service worker VAPID complet avec actions
- [ ] **Mode hors-ligne PWA** — sync différée avec IndexedDB
- [ ] **Paiement Stripe** — ventes en ligne animaux et visites

### Priorité normale
- [ ] **Module météo Guyane** — API OpenWeatherMap avec alertes (cyclone, canicule)
- [ ] **Tableau de bord public** — vitrine de la ferme (espèces, actualités, réservations)
- [ ] **API publique** — clés d'accès OAuth2 pour partenaires éleveurs
- [ ] **Module partenaires** — fournisseurs, vétérinaires externes, portail limité
- [ ] **Intégration GBIF** — biodiversité mondiale, statuts UICN

### Priorité basse
- [ ] **Internationalisation i18n** — fr/en/es/pt
- [ ] **Module statistiques ML** — Python FastAPI avec Prophet/statsmodels
- [ ] **Blockchain traçabilité CITES** — smart contracts pour certificats
- [ ] **Application TV** — affichage public enclos et espèces
- [ ] **Intégration caméras IP** — flux vidéo RTSP, alertes mouvement

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
git tag v9.0.0 && git push origin v9.0.0
```

---

## Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@lftg.fr | Admin1234! | Administrateur |
| soigneur@lftg.fr | User1234! | Soigneur |
| gestionnaire@lftg.fr | User1234! | Gestionnaire |

---

*Signé : William MERI — LFTG Platform v8.0.0 — Mars 2026*
