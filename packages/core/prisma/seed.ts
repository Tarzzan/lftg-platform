import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LFTG Platform database v16.0.0...');
  console.log('📍 La Ferme Tropicale de Guyane — PK20.5 Route du Dégrad Saramacca, 97310 Kourou');
  console.log('   SIRET: 813 099 215 000 28 | N° décl.: 03973232797');

  // ─── Nettoyage (TRUNCATE CASCADE toutes les tables) ────────────────────
  // Nettoyage complet (hors formation — préservée)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "SaleItem", "Sale", "MedicalVisit", "Treatment", "Vaccination", "BroodEvent", "Brood", "AnimalEvent", "Genealogy", "Animal", "StockMovement", "StockRequest", "StockItem", "Meal", "NutritionPlan", "HrDocument", "Skill", "_EmployeeSkills", "Employee", "WorkflowHistory", "WorkflowInstance", "WorkflowDefinition", "AuditLog", "HistoryLog", "Alert", "AlertRule", "PushSubscription", "Document", "Badge", "UserBadge", "GpsTrack", "GpsDevice", "IotReading", "IotDevice", "MlPrediction", "AdvancedReport", "AgendaEvent", "ApiV2Key", "CitesPermit", "Sponsor", "Sponsorship", "Site", "_PermissionToRole", "_TeamUsers", "_UserRoles", "Permission", "Role", "User", "Species", "Enclosure", "Team" CASCADE`);
  // Nettoyage des tables de formation séparément (pour préserver l'ordre FK)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "LearnerNote", "LearnerPrivateNote", "Signature", "AttendanceSheet", "LessonCompletion", "LessonFeedback", "LessonObjective", "FormationDocument", "QuizAnswer", "Quiz", "Enrollment", "Cohort", "Lesson", "Chapter", "CourseObjective", "CoursePrerequisite", "Course", "Certificate" CASCADE`);
  console.log("🗑️  Base nettoyée (TRUNCATE CASCADE — formation incluse)");

  // ─── Permissions ──────────────────────────────────────────────────────────
  await prisma.permission.create({ data: { id: 'manage_all', action: 'manage', subject: 'all', description: 'Accès total à toute la plateforme' } });
  await prisma.permission.create({ data: { id: 'read_Animal', action: 'read', subject: 'Animal', description: 'Voir les animaux' } });
  await prisma.permission.create({ data: { id: 'create_Animal', action: 'create', subject: 'Animal', description: 'Créer des animaux' } });
  await prisma.permission.create({ data: { id: 'update_Animal', action: 'update', subject: 'Animal', description: 'Modifier des animaux' } });
  await prisma.permission.create({ data: { id: 'delete_Animal', action: 'delete', subject: 'Animal', description: 'Supprimer des animaux' } });
  await prisma.permission.create({ data: { id: 'manage_Animal', action: 'manage', subject: 'Animal', description: 'Gérer tous les animaux' } });
  await prisma.permission.create({ data: { id: 'read_Enclosure', action: 'read', subject: 'Enclosure', description: 'Voir les enclos' } });
  await prisma.permission.create({ data: { id: 'manage_Enclosure', action: 'manage', subject: 'Enclosure', description: 'Gérer les enclos' } });
  await prisma.permission.create({ data: { id: 'read_Stock', action: 'read', subject: 'Stock', description: 'Voir le stock' } });
  await prisma.permission.create({ data: { id: 'create_Stock', action: 'create', subject: 'Stock', description: 'Créer des articles de stock' } });
  await prisma.permission.create({ data: { id: 'update_Stock', action: 'update', subject: 'Stock', description: 'Modifier le stock' } });
  await prisma.permission.create({ data: { id: 'manage_Stock', action: 'manage', subject: 'Stock', description: 'Gérer tout le stock' } });
  await prisma.permission.create({ data: { id: 'read_Personnel', action: 'read', subject: 'Personnel', description: 'Voir le personnel' } });
  await prisma.permission.create({ data: { id: 'manage_Personnel', action: 'manage', subject: 'Personnel', description: 'Gérer le personnel' } });
  await prisma.permission.create({ data: { id: 'read_Formation', action: 'read', subject: 'Formation', description: 'Voir les formations' } });
  await prisma.permission.create({ data: { id: 'manage_Formation', action: 'manage', subject: 'Formation', description: 'Gérer les formations' } });
  await prisma.permission.create({ data: { id: 'read_Medical', action: 'read', subject: 'Medical', description: 'Voir les dossiers médicaux' } });
  await prisma.permission.create({ data: { id: 'manage_Medical', action: 'manage', subject: 'Medical', description: 'Gérer les dossiers médicaux' } });
  await prisma.permission.create({ data: { id: 'read_Workflow', action: 'read', subject: 'Workflow', description: 'Voir les workflows' } });
  await prisma.permission.create({ data: { id: 'manage_Workflow', action: 'manage', subject: 'Workflow', description: 'Gérer les workflows' } });
  await prisma.permission.create({ data: { id: 'read_User', action: 'read', subject: 'User', description: 'Voir les utilisateurs' } });
  await prisma.permission.create({ data: { id: 'manage_User', action: 'manage', subject: 'User', description: 'Gérer les utilisateurs' } });
  // Nouvelles permissions Qualiopi / Formation avancée
  await prisma.permission.create({ data: { id: 'progress_read', action: 'read', subject: 'Progress', description: 'Lire la progression des formations' } });
  await prisma.permission.create({ data: { id: 'progress_write', action: 'write', subject: 'Progress', description: 'Modifier la progression des formations' } });
  await prisma.permission.create({ data: { id: 'certificates_read', action: 'read', subject: 'Certificate', description: 'Consulter les certificats' } });
  await prisma.permission.create({ data: { id: 'certificates_issue', action: 'issue', subject: 'Certificate', description: 'Émettre des certificats' } });
  await prisma.permission.create({ data: { id: 'evaluations_read', action: 'read', subject: 'Evaluation', description: 'Consulter les évaluations Qualiopi' } });
  await prisma.permission.create({ data: { id: 'evaluations_write', action: 'write', subject: 'Evaluation', description: 'Remplir les évaluations Qualiopi' } });
  await prisma.permission.create({ data: { id: 'attendance_read', action: 'read', subject: 'Attendance', description: "Consulter les feuilles d'émargement" } });
  await prisma.permission.create({ data: { id: 'attendance_write', action: 'write', subject: 'Attendance', description: "Signer les feuilles d'émargement" } });
  console.log('✅ Permissions créées (dont 8 nouvelles Qualiopi)');

  // ─── Rôles ────────────────────────────────────────────────────────────────
  await prisma.role.create({
    data: { name: 'admin', description: 'Administrateur de la plateforme — accès total', permissions: { connect: [{ id: 'manage_all' }] } },
  });
  await prisma.role.create({
    data: {
      name: 'formateur',
      description: 'Formateur LFTG — gestion pédagogique complète',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'manage_Animal' }, { id: 'read_Enclosure' },
          { id: 'read_Medical' }, { id: 'manage_Medical' }, { id: 'read_Workflow' },
          { id: 'manage_Formation' }, { id: 'read_Personnel' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'soigneur',
      description: 'Soigneur animalier — gestion des animaux et médical',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'create_Animal' }, { id: 'update_Animal' }, { id: 'manage_Animal' },
          { id: 'read_Enclosure' }, { id: 'read_Medical' }, { id: 'manage_Medical' },
          { id: 'read_Workflow' }, { id: 'read_Formation' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'apprenant',
      description: 'Apprenant en formation — accès à l\'espace formation',
      permissions: { connect: [{ id: 'read_Animal' }, { id: 'read_Enclosure' }, { id: 'read_Formation' }] },
    },
  });
  await prisma.role.create({
    data: {
      name: 'gestionnaire',
      description: 'Gestionnaire — stock et personnel',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Enclosure' },
          { id: 'read_Stock' }, { id: 'create_Stock' }, { id: 'update_Stock' }, { id: 'manage_Stock' },
          { id: 'read_Personnel' }, { id: 'manage_Personnel' },
          { id: 'read_Formation' }, { id: 'read_Workflow' }, { id: 'manage_Workflow' },
        ],
      },
    },
  });
  // 6 nouveaux rôles
  await prisma.role.create({
    data: {
      name: 'stagiaire',
      description: 'Stagiaire en immersion au parc',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Enclosure' }, { id: 'read_Formation' },
          { id: 'read_Medical' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'bénévole',
      description: 'Bénévole aidant aux tâches du parc',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Enclosure' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'adhérent',
      description: "Membre de l'association LFTG",
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Formation' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'enseignant',
      description: 'Enseignant / Formateur pour les cours Qualiopi',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Enclosure' }, { id: 'read_Formation' }, { id: 'manage_Formation' },
          { id: 'progress_read' }, { id: 'progress_write' },
          { id: 'evaluations_read' }, { id: 'evaluations_write' },
          { id: 'attendance_read' }, { id: 'attendance_write' },
          { id: 'certificates_read' }, { id: 'certificates_issue' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'élève',
      description: 'Élève / Apprenant inscrit à une formation',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Enclosure' }, { id: 'read_Formation' },
          { id: 'progress_read' }, { id: 'attendance_read' }, { id: 'certificates_read' },
        ],
      },
    },
  });
  await prisma.role.create({
    data: {
      name: 'accompagnateur',
      description: 'Tuteur/référent suivant un élève (Qualiopi)',
      permissions: {
        connect: [
          { id: 'read_Animal' }, { id: 'read_Formation' },
          { id: 'progress_read' }, { id: 'evaluations_read' },
          { id: 'attendance_read' }, { id: 'certificates_read' },
        ],
      },
    },
  });
  console.log('✅ Rôles créés (admin, formateur, soigneur, apprenant, gestionnaire + 6 nouveaux)');

  // ─── Utilisateurs réels LFTG ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  // Compte admin générique
  await prisma.user.create({
    data: { email: 'admin@lftg.fr', name: 'Administration LFTG', password: adminPassword, roles: { connect: [{ name: 'admin' }] } },
  });

  // William MERI — Directeur / Admin
  await prisma.user.create({
    data: { email: 'william.meri@lftg.fr', name: 'William MERI', password: adminPassword, roles: { connect: [{ name: 'admin' }] } },
  });

  // Elodie TRANQUARD — Formatrice Capacitaire (mentionnée dans le livret de suivi LFTG)
  const elodie = await prisma.user.create({
    data: { email: 'elodie.tranquard@lftg.fr', name: 'Elodie TRANQUARD', password: userPassword, roles: { connect: [{ name: 'formateur' }] } },
  });

  // Soigneur
  await prisma.user.create({
    data: { email: 'soigneur@lftg.fr', name: 'Marie Dupont', password: userPassword, roles: { connect: [{ name: 'soigneur' }] } },
  });

  // Gestionnaire
  await prisma.user.create({
    data: { email: 'gestionnaire@lftg.fr', name: 'Jean Martin', password: userPassword, roles: { connect: [{ name: 'gestionnaire' }] } },
  });

  // Apprenants — Cohorte CCAND-EGG 2025-2026
  const apprenants = await Promise.all([
    prisma.user.create({ data: { email: 'lucas.moreau@formation.lftg.fr', name: 'Lucas Moreau', password: userPassword, roles: { connect: [{ name: 'apprenant' }] } } }),
    prisma.user.create({ data: { email: 'camille.bernard@formation.lftg.fr', name: 'Camille Bernard', password: userPassword, roles: { connect: [{ name: 'apprenant' }] } } }),
    prisma.user.create({ data: { email: 'theo.petit@formation.lftg.fr', name: 'Théo Petit', password: userPassword, roles: { connect: [{ name: 'apprenant' }] } } }),
    prisma.user.create({ data: { email: 'sarah.leroy@formation.lftg.fr', name: 'Sarah Leroy', password: userPassword, roles: { connect: [{ name: 'apprenant' }] } } }),
    prisma.user.create({ data: { email: 'antoine.simon@formation.lftg.fr', name: 'Antoine Simon', password: userPassword, roles: { connect: [{ name: 'apprenant' }] } } }),
  ]);
  // 3 nouveaux utilisateurs de test
  const elevePassword = await bcrypt.hash('Eleve1234!', 12);
  const enseignantPassword = await bcrypt.hash('Enseignant1234!', 12);
  const stagiairePassword = await bcrypt.hash('Stagiaire1234!', 12);
  await prisma.user.create({
    data: { email: 'eleve.test@lftg.fr', name: 'Élève Test', password: elevePassword, roles: { connect: [{ name: 'élève' }] } },
  });
  await prisma.user.create({
    data: { email: 'enseignant.test@lftg.fr', name: 'Enseignant Test', password: enseignantPassword, roles: { connect: [{ name: 'enseignant' }] } },
  });
  await prisma.user.create({
    data: { email: 'stagiaire.test@lftg.fr', name: 'Stagiaire Test', password: stagiairePassword, roles: { connect: [{ name: 'stagiaire' }] } },
  });
  console.log('✅ Utilisateurs LFTG créés (William MERI, Elodie TRANQUARD, soigneurs, 5 apprenants + 3 nouveaux)');

  // ─── Espèces de la faune guyanaise ────────────────────────────────────────
  const species = await Promise.all([
    prisma.species.create({ data: { name: 'Ara chloroptère', scientificName: 'Ara chloropterus', commonName: 'Ara rouge', citesStatus: 'II', citesAppendix: 'II', conservationStatus: 'LC', origin: 'Amérique du Sud', habitat: 'Forêt tropicale', diet: 'Frugivore', lifespan: 50, description: 'Grand perroquet emblématique de la forêt amazonienne guyanaise, reconnaissable à son plumage rouge vif.' } }),
    prisma.species.create({ data: { name: 'Caïman noir', scientificName: 'Melanosuchus niger', commonName: 'Grand caïman noir', citesStatus: 'I', citesAppendix: 'I', conservationStatus: 'LC', origin: 'Amazonie', habitat: 'Zones humides', diet: 'Carnivore', lifespan: 40, description: 'Le plus grand crocodilien d\'Amazonie, espèce protégée par la CITES Annexe I.' } }),
    prisma.species.create({ data: { name: 'Tortue matamata', scientificName: 'Chelus fimbriata', commonName: 'Matamata', citesStatus: 'II', citesAppendix: 'II', conservationStatus: 'LC', origin: 'Guyane française', habitat: 'Eaux calmes', diet: 'Carnivore (poissons)', lifespan: 30, description: 'Tortue aquatique unique à l\'aspect de feuille morte, endémique de l\'Amazonie.' } }),
    prisma.species.create({ data: { name: 'Anaconda vert', scientificName: 'Eunectes murinus', commonName: 'Grand anaconda', citesStatus: 'Non listé', conservationStatus: 'LC', origin: 'Amazonie', habitat: 'Zones marécageuses', diet: 'Carnivore', lifespan: 20, description: 'Le plus grand serpent du monde en masse, présent dans les marais guyanais.' } }),
    prisma.species.create({ data: { name: 'Toucan toco', scientificName: 'Ramphastos toco', commonName: 'Toucan toucan', citesStatus: 'II', citesAppendix: 'II', conservationStatus: 'LC', origin: 'Amérique du Sud', habitat: 'Lisière forêt', diet: 'Frugivore', lifespan: 20, description: 'Oiseau emblématique reconnaissable à son énorme bec coloré orange et noir.' } }),
    prisma.species.create({ data: { name: 'Agouti des savanes', scientificName: 'Dasyprocta leporina', commonName: 'Agouti', citesStatus: 'Non listé', conservationStatus: 'LC', origin: 'Guyane française', habitat: 'Forêt tropicale', diet: 'Herbivore', lifespan: 15, description: 'Rongeur important pour la dispersion des graines en forêt guyanaise.' } }),
    prisma.species.create({ data: { name: 'Pécari à lèvres blanches', scientificName: 'Tayassu pecari', commonName: 'Pécari', citesStatus: 'II', citesAppendix: 'II', conservationStatus: 'VU', origin: 'Amazonie', habitat: 'Forêt dense', diet: 'Omnivore', lifespan: 13, description: 'Suidé sauvage vivant en groupes dans la forêt amazonienne guyanaise.' } }),
    prisma.species.create({ data: { name: 'Caïman à lunettes', scientificName: 'Caiman crocodilus', commonName: 'Caïman commun', citesStatus: 'II', citesAppendix: 'II', conservationStatus: 'LC', origin: 'Guyane française', habitat: 'Rivières et marais', diet: 'Carnivore', lifespan: 30, description: 'Crocodilien le plus commun de Guyane, reconnaissable à son arc osseux entre les yeux.' } }),
  ]);
  console.log('✅ 8 espèces de la faune guyanaise créées');

  // ─── Enclos LFTG ──────────────────────────────────────────────────────────
  const enclosures = await Promise.all([
    prisma.enclosure.create({ data: { name: 'Volière tropicale', code: 'VOL-01', type: 'volière', description: 'Grande volière accueillant les aras et toucans', capacity: 20, surface: 150, location: 'Zone Nord — PK20.5', status: 'ACTIVE' } }),
    prisma.enclosure.create({ data: { name: 'Bassin caïmans', code: 'BAS-01', type: 'bassin', description: 'Bassin sécurisé pour les caïmans noirs et à lunettes', capacity: 4, surface: 80, location: 'Zone Est — PK20.5', status: 'ACTIVE' } }),
    prisma.enclosure.create({ data: { name: 'Terrarium serpents', code: 'TER-01', type: 'terrarium', description: 'Terrarium climatisé pour les anacondas et boas', capacity: 8, surface: 30, location: 'Bâtiment pédagogique', status: 'ACTIVE' } }),
    prisma.enclosure.create({ data: { name: 'Bassin tortues', code: 'BAS-02', type: 'bassin', description: 'Bassin aquatique pour les tortues matamata', capacity: 10, surface: 40, location: 'Zone Centrale', status: 'ACTIVE' } }),
    prisma.enclosure.create({ data: { name: 'Enclos mammifères', code: 'ENC-01', type: 'paddock', description: 'Enclos extérieur pour les agoutis et pécaris', capacity: 15, surface: 200, location: 'Zone Ouest — PK20.5', status: 'ACTIVE' } }),
    prisma.enclosure.create({ data: { name: 'Quarantaine', code: 'QUA-01', type: 'cage', description: 'Zone d\'isolement et de quarantaine vétérinaire', capacity: 5, surface: 20, location: 'Bâtiment vétérinaire', status: 'ACTIVE' } }),
  ]);
  console.log('✅ 6 enclos LFTG créés');

  // ─── Données de démo animaux/couvées supprimées (mode production) ──────────
  console.log('ℹ️  Mode production : aucun animal ni couvée de démo créé.');
  console.log("   Les soigneurs saisiront les vrais animaux via l interface.");

  // ─── Plans de nutrition ───────────────────────────────────────────────────
  for (const s of species) {
    await prisma.nutritionPlan.create({
      data: { speciesId: s.id, name: `Plan standard pour ${s.name}`, description: `Régime alimentaire équilibré adapté aux besoins spécifiques de ${s.name} en captivité.` },
    });
  }
  console.log('✅ Plans de nutrition créés');

  // ─── Sites LFTG ───────────────────────────────────────────────────────────
  await prisma.site.create({ data: { name: 'La Ferme Tropicale de Guyane', location: 'PK20.5 Route du Dégrad Saramacca, 97310 Kourou, Guyane' } });
  await prisma.site.create({ data: { name: 'Bâtiment pédagogique LFTG', location: 'PK20.5 Route du Dégrad Saramacca, 97310 Kourou, Guyane' } });
  console.log('✅ Sites LFTG créés');

  // ─── Formation RNCP — Soigneur Animalier en Parc Zoologique ──────────────
  const courseSoigneur = await prisma.course.create({
    data: {
      title: 'Soigneur Animalier en Parc Zoologique',
      description: 'Formation certifiante basée sur le référentiel RNCP. Prépare aux compétences professionnelles de soigneur animalier en parc zoologique : santé et bien-être animal, gestion des installations, sensibilisation du public. Dispensée par La Ferme Tropicale de Guyane (LFTG) — Organisme de formation enregistré sous le N° 03973232797 auprès du préfet de région de Guyane.',
      category: 'RNCP',
      level: 'INTERMEDIAIRE',
      duration: 400,
      tags: ['soigneur', 'animalier', 'zoo', 'RNCP', 'Guyane', 'LFTG', 'Qualiopi', 'CCAND'],
      isPublished: true,
    },
  });

  // Bloc 1 — Santé et bien-être des animaux
  const bloc1 = await prisma.chapter.create({ data: { courseId: courseSoigneur.id, title: 'Bloc 1 — Contribuer à la santé et au bien-être des animaux en parc zoologique', order: 1 } });
  const lessonsBloc1 = await Promise.all([
    prisma.lesson.create({ data: { chapterId: bloc1.id, title: '1.1 — Alimentation et nutrition animale', content: 'Sélectionner les aliments parmi diverses catégories (fruits, légumes, viandes, poissons, granulés). Préparer les rations alimentaires en respectant les protocoles et consignes sanitaires. Appliquer les protocoles adaptés lors de la distribution. Observer la prise alimentaire pour alerter et adapter la nutrition en cas d\'anomalies.', order: 1, duration: 120 } }),
    prisma.lesson.create({ data: { chapterId: bloc1.id, title: '1.2 — Observation et surveillance des animaux', content: 'Identifier les besoins biologiques et comportementaux de l\'animal. Observer et analyser le comportement pour détecter les signes de stress ou de maladie (stéréotypie, blessures, changements comportementaux). Tenir un registre d\'observations quotidiennes. Protocoles d\'alerte vétérinaire.', order: 2, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc1.id, title: '1.3 — Soins de base et protocoles sanitaires', content: 'Application des protocoles sanitaires en vigueur. Manipulation sécurisée des animaux. Désinfection des mains avant et après chaque contact. Gestion des médicaments de base. Collaboration avec le vétérinaire. Gestion des situations d\'urgence médicale.', order: 3, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc1.id, title: '1.4 — Communication d\'équipe et sécurité', content: 'Rédaction des comptes-rendus d\'intervention sur le registre. Communication des incidents à l\'équipe. Protocoles de sécurité en présence d\'animaux dangereux. Gestion des situations d\'urgence. Signalement de tout accident à un responsable.', order: 4, duration: 60 } }),
  ]);

  // Bloc 2 — Gestion et entretien des installations
  const bloc2 = await prisma.chapter.create({ data: { courseId: courseSoigneur.id, title: 'Bloc 2 — Gérer et entretenir les installations du parc zoologique', order: 2 } });
  const lessonsBloc2 = await Promise.all([
    prisma.lesson.create({ data: { chapterId: bloc2.id, title: '2.1 — Nettoyage et désinfection des enclos', content: 'Protocoles de nettoyage quotidien et périodique des enclos. Produits désinfectants adaptés à chaque espèce. Élimination des déchets organiques (excréments, restes alimentaires). Registre des interventions. Respect du bien-être animal pendant le nettoyage.', order: 1, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc2.id, title: '2.2 — Entretien des équipements et infrastructures', content: 'Maintenance préventive des équipements. Utilisation des outils techniques (souffleuse, débroussailleuse, sécateurs). Traitements antiparasitaires et antifongiques sur les surfaces. Démontage et nettoyage en profondeur des équipements (abris, enrichissements, points d\'eau).', order: 2, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc2.id, title: '2.3 — Aménagement et enrichissement des enclos', content: 'Concevoir des plans d\'aménagement en fonction des besoins spécifiques des espèces. Installer les équipements nécessaires (abris, points d\'eau, enrichissements comportementaux). Aménager des espaces végétalisés pour recréer l\'habitat naturel. Évaluation du bien-être par l\'observation comportementale.', order: 3, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc2.id, title: '2.4 — Gestion des espaces verts et végétation tropicale', content: 'Identification des végétaux présents dans les enclos guyanais. Entretien des espaces verts tropicaux. Sélection des plantes compatibles avec les espèces hébergées. Techniques de jardinage tropical. Retrait des végétaux non désirés.', order: 4, duration: 60 } }),
  ]);

  // Bloc 3 — Sensibilisation et éducation du public
  const bloc3 = await prisma.chapter.create({ data: { courseId: courseSoigneur.id, title: 'Bloc 3 — Sensibiliser et éduquer le public à la préservation des animaux', order: 3 } });
  const lessonsBloc3 = await Promise.all([
    prisma.lesson.create({ data: { chapterId: bloc3.id, title: '3.1 — Préparation des animations pédagogiques', content: 'Analyser le profil des publics cibles (enfants, adultes, scolaires, personnes en situation de handicap). Organiser le discours selon les spécificités de chaque espèce (biologie, comportement, enjeux de conservation). Préparer le matériel pédagogique adapté.', order: 1, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc3.id, title: '3.2 — Animation et prise de parole en public', content: 'Techniques de prise de parole pour captiver l\'auditoire. Expliciter des concepts complexes sur l\'animal (habitat, comportement, alimentation). Répondre efficacement aux questions du public. Adaptation du discours en temps réel selon le niveau de l\'auditoire.', order: 2, duration: 90 } }),
    prisma.lesson.create({ data: { chapterId: bloc3.id, title: '3.3 — Sensibilisation aux enjeux de conservation', content: 'Cadre réglementaire et éthique (EAZA, conventions CITES, droit français). Enjeux environnementaux : déforestation, braconnage, disparition des habitats en Guyane. Rôle des parcs zoologiques dans la conservation des espèces. Programmes d\'élevage en captivité et réintroduction.', order: 3, duration: 90 } }),
  ]);

  // Bloc 4 — Évaluation et certification
  const bloc4 = await prisma.chapter.create({ data: { courseId: courseSoigneur.id, title: 'Évaluation finale et certification RNCP', order: 4 } });
  const lessonsBloc4 = await Promise.all([
    prisma.lesson.create({ data: { chapterId: bloc4.id, title: 'Préparation au dossier professionnel', content: 'Méthodologie de constitution du dossier professionnel. Présentation des pratiques professionnelles exposées. Mise en situation réelle ou simulée avec les animaux de la LFTG. Préparation à l\'entretien d\'explicitation.', order: 1, duration: 60 } }),
    prisma.lesson.create({ data: { chapterId: bloc4.id, title: 'Mise en situation pratique — Évaluation finale', content: 'Évaluation pratique sur site avec les animaux de la LFTG. Observation, alimentation, soins de base. Présentation d\'une animation pédagogique devant jury. Entretien oral de 20 minutes. Critères d\'évaluation RNCP.', order: 2, duration: 120 } }),
  ]);

  // Quiz pédagogiques — Bloc 1
  const quizB1L1 = await prisma.quiz.create({ data: { lessonId: lessonsBloc1[0].id, question: 'Quelle est la première étape avant de distribuer de la nourriture à un animal ?', options: JSON.stringify(['Vérifier la fiche alimentaire de l\'espèce', 'Peser l\'animal', 'Nettoyer l\'enclos', 'Contacter le vétérinaire']), answer: 'Vérifier la fiche alimentaire de l\'espèce' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc1[0].id, question: 'Quel type d\'aliment est adapté aux aras chloroptères de la LFTG ?', options: JSON.stringify(['Fruits tropicaux, noix et graines', 'Viande crue uniquement', 'Granulés pour chiens', 'Poissons frais']), answer: 'Fruits tropicaux, noix et graines' } });
  const quizB1L2 = await prisma.quiz.create({ data: { lessonId: lessonsBloc1[1].id, question: 'Quel signe comportemental peut indiquer un stress chez un animal en captivité ?', options: JSON.stringify(['Stéréotypie (mouvements répétitifs)', 'Prise alimentaire normale', 'Comportement social habituel', 'Selles normales']), answer: 'Stéréotypie (mouvements répétitifs)' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc1[1].id, question: 'À quelle fréquence doit-on remplir le registre d\'observations ?', options: JSON.stringify(['Quotidiennement', 'Hebdomadairement', 'Uniquement en cas d\'incident', 'Mensuellement']), answer: 'Quotidiennement' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc1[2].id, question: 'Quelle est la règle d\'or avant et après tout contact avec un animal ?', options: JSON.stringify(['Se laver les mains avec un désinfectant', 'Mettre des gants uniquement', 'Rien de particulier si l\'animal est sain', 'Appeler le vétérinaire']), answer: 'Se laver les mains avec un désinfectant' } });
  // Quiz — Bloc 2
  const quizB2L1 = await prisma.quiz.create({ data: { lessonId: lessonsBloc2[0].id, question: 'À quelle fréquence minimale doit-on nettoyer les enclos ?', options: JSON.stringify(['Quotidiennement', 'Hebdomadairement', 'Mensuellement', 'Selon les besoins uniquement']), answer: 'Quotidiennement' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc2[2].id, question: 'Quel est l\'objectif principal de l\'enrichissement comportemental ?', options: JSON.stringify(['Stimuler les comportements naturels et réduire le stress', 'Décorer l\'enclos pour les visiteurs', 'Faciliter le nettoyage', 'Réduire la consommation alimentaire']), answer: 'Stimuler les comportements naturels et réduire le stress' } });
  // Quiz — Bloc 3
  await prisma.quiz.create({ data: { lessonId: lessonsBloc3[0].id, question: 'Comment adapter une animation pédagogique à un public de jeunes enfants ?', options: JSON.stringify(['Utiliser un vocabulaire simple et des supports visuels', 'Utiliser le même discours que pour les adultes', 'Ne pas mentionner les aspects de conservation', 'Éviter toute interaction avec les animaux']), answer: 'Utiliser un vocabulaire simple et des supports visuels' } });
  const quizB3L3 = await prisma.quiz.create({ data: { lessonId: lessonsBloc3[2].id, question: 'Quelle convention internationale réglemente le commerce des espèces sauvages ?', options: JSON.stringify(['CITES (Convention de Washington)', 'Convention de Berne', 'Protocole de Kyoto', 'Convention de Ramsar']), answer: 'CITES (Convention de Washington)' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc3[2].id, question: 'Le caïman noir (Melanosuchus niger) est classé dans quelle annexe CITES ?', options: JSON.stringify(['Annexe I (espèce menacée d\'extinction)', 'Annexe II', 'Annexe III', 'Non listé']), answer: 'Annexe I (espèce menacée d\'extinction)' } });
  // Quiz — Bloc 4
  await prisma.quiz.create({ data: { lessonId: lessonsBloc4[0].id, question: 'Qu\'est-ce que le dossier professionnel dans le cadre du RNCP ?', options: JSON.stringify(['Un document décrivant les pratiques professionnelles réelles du candidat', 'Un CV détaillé', 'Un rapport de stage uniquement', 'Une liste de formations suivies']), answer: 'Un document décrivant les pratiques professionnelles réelles du candidat' } });
  console.log('✅ Formation RNCP "Soigneur Animalier" créée (4 blocs, 13 leçons, 11 quiz)');

  // ─── Cohorte CCAND-EGG 2025-2026 ─────────────────────────────────────────
  const cohorteCCAND = await prisma.cohort.create({
    data: { courseId: courseSoigneur.id, name: 'CCAND-EGG — Promotion 2025-2026', status: 'ACTIVE', maxStudents: 12, startDate: new Date('2025-10-06'), endDate: new Date('2026-06-30') },
  });

  const enrollments = await Promise.all(
    apprenants.map((apprenant) =>
      prisma.enrollment.create({ data: { cohortId: cohorteCCAND.id, userId: apprenant.id, progress: faker.number.float({ min: 0.1, max: 0.8, fractionDigits: 2 }) } })
    )
  );

  // Complétion de leçons pour les apprenants avancés
  const allLessons = [...lessonsBloc1, ...lessonsBloc2, ...lessonsBloc3, ...lessonsBloc4];
  for (const apprenant of apprenants.slice(0, 3)) {
    for (const lesson of allLessons.slice(0, 5)) {
      await prisma.lessonCompletion.create({ data: { lessonId: lesson.id, userId: apprenant.id, timeSpent: faker.number.int({ min: 600, max: 3600 }) } });
    }
  }

  // Feuilles d'émargement — Sessions 1 à 4
  const session1 = await prisma.attendanceSheet.create({
    data: { cohortId: cohorteCCAND.id, sessionDate: new Date('2025-10-06'), sessionTitle: 'Session 1 — Introduction et présentation de la LFTG', duration: 420 },
  });
  await prisma.attendanceSheet.create({
    data: { cohortId: cohorteCCAND.id, sessionDate: new Date('2025-10-20'), sessionTitle: 'Session 2 — Bloc 1 : Alimentation et soins de base', duration: 420 },
  });
  await prisma.attendanceSheet.create({
    data: { cohortId: cohorteCCAND.id, sessionDate: new Date('2025-11-03'), sessionTitle: 'Session 3 — Bloc 2 : Entretien des enclos (pratique)', duration: 420 },
  });
  await prisma.attendanceSheet.create({
    data: { cohortId: cohorteCCAND.id, sessionDate: new Date('2025-11-17'), sessionTitle: 'Session 4 — Bloc 3 : Animation pédagogique', duration: 420 },
  });
  // Signatures numériques — Session 1 (Lucas et Camille)
  await prisma.signature.create({ data: { userId: apprenants[0].id, enrollmentId: enrollments[0].id, attendanceSheetId: session1.id, signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', type: 'ENTRY', sessionDate: new Date('2025-10-06') } });
  await prisma.signature.create({ data: { userId: apprenants[1].id, enrollmentId: enrollments[1].id, attendanceSheetId: session1.id, signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', type: 'ENTRY', sessionDate: new Date('2025-10-06') } });

  // Notes pédagogiques de la formatrice Elodie TRANQUARD
  await prisma.learnerNote.create({ data: { enrollmentId: enrollments[0].id, authorId: elodie.id, content: 'Lucas montre un excellent sens de l\'observation. Très à l\'aise avec les manipulations animales. À encourager dans la rédaction des comptes-rendus quotidiens.', type: 'OBSERVATION', isPrivate: false } });
  await prisma.learnerNote.create({ data: { enrollmentId: enrollments[1].id, authorId: elodie.id, content: 'Camille est très motivée et assidue. Quelques difficultés sur les protocoles sanitaires à revoir lors de la prochaine session pratique.', type: 'BILAN', isPrivate: false } });
  await prisma.learnerNote.create({ data: { enrollmentId: enrollments[2].id, authorId: elodie.id, content: 'Théo progresse bien. A réussi tous les quiz du Bloc 1. Prêt pour les évaluations pratiques du Bloc 2.', type: 'ENCOURAGEMENT', isPrivate: false } });
  // Feedbacks apprenants (Qualiopi I32) — sans champ 'difficulty' (non présent dans le schéma)
  await prisma.lessonFeedback.create({ data: { lessonId: lessonsBloc1[0].id, userId: apprenants[0].id, rating: 5, comment: 'Très bonne introduction à la nutrition animale. Les exemples avec les aras de la LFTG sont très concrets.' } });
  await prisma.lessonFeedback.create({ data: { lessonId: lessonsBloc1[1].id, userId: apprenants[1].id, rating: 4, comment: 'Intéressant. J\'aurais aimé plus d\'exemples pratiques sur la détection du stress.' } });
  await prisma.lessonFeedback.create({ data: { lessonId: lessonsBloc2[0].id, userId: apprenants[2].id, rating: 5, comment: 'Protocoles clairs et bien expliqués. Prêt pour la mise en pratique.' } });
  await prisma.lessonFeedback.create({ data: { lessonId: lessonsBloc3[2].id, userId: apprenants[0].id, rating: 4, comment: 'La réglementation CITES est complexe mais essentielle. Besoin d\'un récapitulatif.' } });
  // Badges globaux (définition) + attribution via UserBadge
  const badgeFirstLesson = await prisma.badge.upsert({ where: { code: 'FIRST_LESSON' }, update: {}, create: { code: 'FIRST_LESSON', name: 'Première leçon', description: 'A complété sa première leçon sur la plateforme LFTG', icon: '🌱', color: '#22c55e', condition: 'Compléter au moins 1 leçon' } });
  const badgeBloc1 = await prisma.badge.upsert({ where: { code: 'BLOC1_COMPLETE' }, update: {}, create: { code: 'BLOC1_COMPLETE', name: 'Bloc 1 maîtrisé', description: 'A validé toutes les leçons du Bloc 1 — Santé et bien-être animal', icon: '🏆', color: '#f59e0b', condition: 'Compléter toutes les leçons du Bloc 1' } });
  await prisma.userBadge.create({ data: { userId: apprenants[0].id, badgeId: badgeFirstLesson.id } });
  await prisma.userBadge.create({ data: { userId: apprenants[0].id, badgeId: badgeBloc1.id } });
  await prisma.userBadge.create({ data: { userId: apprenants[2].id, badgeId: badgeFirstLesson.id } });
  console.log('✅ Cohorte CCAND-EGG 2025-2026 créée (5 apprenants, 4 sessions, signatures, feedbacks, badges)');

  console.log('\n🎉 Seed v20.0.0 terminé avec succès !');
  console.log('\n🏢 Organisme : La Ferme Tropicale de Guyane (LFTG)');
  console.log('   SIRET     : 813 099 215 000 28');
  console.log('   Adresse   : PK 20,5 Route du Dégrad Saramacca, 97310 Kourou, Guyane');
  console.log('   N° décl.  : 03973232797 (Préfet de région de Guyane)');
  console.log('   Tél       : 0694 96 13 76 | Email : lftg973@gmail.com');
  console.log('\n📋 Comptes disponibles :');
  console.log('  admin@lftg.fr                    / Admin1234!  → Administrateur');
  console.log('  william.meri@lftg.fr             / Admin1234!  → William MERI (Directeur)');
  console.log('  elodie.tranquard@lftg.fr         / User1234!   → Elodie TRANQUARD (Formatrice)');
  console.log('  soigneur@lftg.fr                 / User1234!   → Soigneur animalier');
  console.log('  gestionnaire@lftg.fr             / User1234!   → Gestionnaire');
  console.log('  lucas.moreau@formation.lftg.fr   / User1234!   → Apprenant (Lucas Moreau)');
  console.log('  eleve.test@lftg.fr               / Eleve1234!  → Élève (test)');
  console.log('  enseignant.test@lftg.fr          / Enseignant1234! → Enseignant (test)');
  console.log('  stagiaire.test@lftg.fr           / Stagiaire1234! → Stagiaire (test)');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
