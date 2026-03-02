# Module Formation Qualiopi — v16.0.0
## La Ferme Tropicale de Guyane (LFTG)
**SIRET** : 813 099 215 000 28 | **N° déclaration** : 03973232797  
**Adresse** : PK 20,5 Route du Dégrad Saramacca, 97310 Kourou, Guyane Française

---

## Nouvelles fonctionnalités v16.0.0

### 1. Espace Admin Formation
- **Catalogue de cours** : gestion complète avec chapitres, leçons et supports multi-format
- **Upload multi-format** : PDF, PPT/PPTX, MP4, MKV, AVI, ZIP, HTML (drag & drop)
- **Mode d'affichage configurable** par document : Fenêtre embarquée (iframe), Nouvel onglet, Modale
- **Page détail cours** : éditeur de chapitres/leçons inline, gestion des documents par leçon

### 2. Espace Apprenant
- **Mon Parcours** : vue globale avec anneau de progression animé, statut par formation
- **Lecteur de leçons** : sidebar plan de cours, navigation leçon par leçon, auto-avancement
- **Lecteur multi-format** : PDF/PPT (iframe), vidéo (player natif), HTML (sandbox), ZIP (download)
- **Quiz intégrés** : évaluation par QCM avec feedback immédiat et score

### 3. Émargement Numérique (Indicateur 10 Qualiopi)
- **Pad de signature numérique** : canvas tactile/souris, validation par apprenant
- **Feuilles de séance** : titre, date, durée, nombre d'apprenants attendus
- **Taux d'assiduité** : calcul automatique avec alerte si < 70% (seuil Qualiopi)
- **Historique des signatures** : affichage visuel des signatures avec horodatage

### 4. Tableau de Bord Qualiopi
- **6 indicateurs Qualiopi** : I10 (assiduité), I11 (progression), I12 (engagement), I13 (accompagnement), I14 (ressources), I16 (décrochage)
- **Suivi individuel** : progression, émargements, quiz, notes par apprenant
- **Alertes décrochage** : identification automatique des apprenants à risque (< 30%)
- **Export rapport** : bouton d'export pour l'auditeur

### 5. Données Réelles LFTG
- **Référentiel RNCP Soigneur Animalier** : 3 blocs de compétences, 12 leçons pré-chargées
- **Espèces animales** : 15 espèces réelles de la LFTG (Ara ararauna, Caiman crocodilus, etc.)
- **Enclos** : 8 enclos réels avec codes et capacités
- **Équipe** : données administratives réelles (Elodie TRANQUARD, etc.)

### 6. Schéma Prisma étendu
Nouveaux modèles : `CourseDocument`, `LessonProgress`, `AttendanceSheet`, `AttendanceSignature`,
`LearnerNote`, `QuizAnswer`, `CourseCategory`

---

## Conformité Qualiopi
| Critère | Indicateur | Fonctionnalité |
|---|---|---|
| Critère 1 | I1-I3 | Informations sur l'offre de formation (catalogue public) |
| Critère 2 | I4-I6 | Identification des objectifs (RNCP structuré par blocs) |
| Critère 3 | I7-I9 | Adaptation aux publics (niveaux, prérequis) |
| Critère 4 | I10-I11 | Émargement numérique + suivi progression |
| Critère 5 | I12-I14 | Quiz, ressources multi-format, notes formateur |
| Critère 6 | I15-I16 | Alertes décrochage, accompagnement individualisé |
| Critère 7 | I17-I18 | Évaluation des acquis (quiz, score final) |
