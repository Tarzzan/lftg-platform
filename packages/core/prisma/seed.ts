import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LFTG Platform database v16.0.0...');
  console.log('📍 La Ferme Tropicale de Guyane — PK20.5 Route du Dégrad Saramacca, 97310 Kourou');
  console.log('   SIRET: 813 099 215 000 28 | N° décl.: 03973232797');

  // ─── Nettoyage ────────────────────────────────────────────────────────────
  await prisma.learnerNote.deleteMany({});
  await prisma.signature.deleteMany({});
  await prisma.attendanceSheet.deleteMany({});
  await prisma.lessonCompletion.deleteMany({});
  await prisma.formationDocument.deleteMany({});
  await prisma.quizAnswer.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.cohort.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.species.deleteMany({});
  await prisma.enclosure.deleteMany({});

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
  console.log('✅ Permissions créées');

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
  console.log('✅ Rôles créés (admin, formateur, soigneur, apprenant, gestionnaire)');

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
  console.log('✅ Utilisateurs LFTG créés (William MERI, Elodie TRANQUARD, soigneurs, 5 apprenants)');

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

  // ─── Animaux nommés + générés ─────────────────────────────────────────────
  const animalData = [
    { identifier: 'ARA-001', name: 'Amazonie', speciesIdx: 0, enclosureIdx: 0, sex: 'female', birthDate: new Date('2018-03-15') },
    { identifier: 'ARA-002', name: 'Bolivar', speciesIdx: 0, enclosureIdx: 0, sex: 'male', birthDate: new Date('2017-07-22') },
    { identifier: 'ARA-003', name: 'Cayenne', speciesIdx: 0, enclosureIdx: 0, sex: 'female', birthDate: new Date('2020-01-10') },
    { identifier: 'CAI-001', name: 'Noir', speciesIdx: 1, enclosureIdx: 1, sex: 'male', birthDate: new Date('2015-06-01') },
    { identifier: 'CAI-002', name: 'Noire', speciesIdx: 1, enclosureIdx: 1, sex: 'female', birthDate: new Date('2016-04-18') },
    { identifier: 'CAI-003', name: 'Lunette', speciesIdx: 7, enclosureIdx: 1, sex: 'male', birthDate: new Date('2019-09-05') },
    { identifier: 'TOR-001', name: 'Mata', speciesIdx: 2, enclosureIdx: 3, sex: 'female', birthDate: new Date('2014-11-30') },
    { identifier: 'TOR-002', name: 'Mata II', speciesIdx: 2, enclosureIdx: 3, sex: 'male', birthDate: new Date('2016-08-12') },
    { identifier: 'ANA-001', name: 'Anaconda', speciesIdx: 3, enclosureIdx: 2, sex: 'female', birthDate: new Date('2013-05-20') },
    { identifier: 'ANA-002', name: 'Boa', speciesIdx: 3, enclosureIdx: 2, sex: 'male', birthDate: new Date('2017-02-14') },
    { identifier: 'TOU-001', name: 'Toucan', speciesIdx: 4, enclosureIdx: 0, sex: 'male', birthDate: new Date('2019-12-03') },
    { identifier: 'TOU-002', name: 'Toco', speciesIdx: 4, enclosureIdx: 0, sex: 'female', birthDate: new Date('2020-03-25') },
    { identifier: 'AGO-001', name: 'Agou', speciesIdx: 5, enclosureIdx: 4, sex: 'male', birthDate: new Date('2021-07-08') },
    { identifier: 'AGO-002', name: 'Agouette', speciesIdx: 5, enclosureIdx: 4, sex: 'female', birthDate: new Date('2021-07-08') },
    { identifier: 'PEC-001', name: 'Pécari', speciesIdx: 6, enclosureIdx: 4, sex: 'male', birthDate: new Date('2020-10-15') },
  ];
  for (const a of animalData) {
    await prisma.animal.create({
      data: { identifier: a.identifier, name: a.name, speciesId: species[a.speciesIdx].id, enclosureId: enclosures[a.enclosureIdx].id, sex: a.sex, birthDate: a.birthDate, status: 'ACTIF', origin: 'ACQUISITION' },
    });
  }
  for (let i = 16; i < 52; i++) {
    await prisma.animal.create({
      data: { identifier: `ANI-${String(i).padStart(3, '0')}`, name: faker.person.firstName(), speciesId: species[i % species.length].id, enclosureId: enclosures[i % enclosures.length].id, sex: faker.helpers.arrayElement(['male', 'female']), birthDate: faker.date.past({ years: 8 }), status: 'ACTIF' },
    });
  }
  console.log('✅ 52 animaux créés (15 nommés + 37 générés)');

  // ─── Couvées ──────────────────────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    await prisma.brood.create({
      data: { speciesId: species[i % species.length].id, incubationStartDate: faker.date.past({ years: 1 }), expectedHatchDate: faker.date.future({ years: 1 }), eggCount: faker.number.int({ min: 2, max: 8 }), status: faker.helpers.arrayElement(['INCUBATION', 'ECLOSION', 'TERMINEE']), temperature: faker.number.float({ min: 28, max: 32, fractionDigits: 1 }), humidity: faker.number.float({ min: 60, max: 85, fractionDigits: 1 }) },
    });
  }
  console.log('✅ 8 couvées créées');

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

  // Quiz pédagogiques
  await prisma.quiz.create({ data: { lessonId: lessonsBloc1[0].id, question: 'Quelle est la première étape avant de distribuer de la nourriture à un animal ?', options: JSON.stringify(['Vérifier la fiche alimentaire de l\'espèce', 'Peser l\'animal', 'Nettoyer l\'enclos', 'Contacter le vétérinaire']), answer: 'Vérifier la fiche alimentaire de l\'espèce' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc1[1].id, question: 'Quel signe comportemental peut indiquer un stress chez un animal en captivité ?', options: JSON.stringify(['Stéréotypie (mouvements répétitifs)', 'Prise alimentaire normale', 'Comportement social habituel', 'Selles normales']), answer: 'Stéréotypie (mouvements répétitifs)' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc2[0].id, question: 'À quelle fréquence minimale doit-on nettoyer les enclos ?', options: JSON.stringify(['Quotidiennement', 'Hebdomadairement', 'Mensuellement', 'Selon les besoins uniquement']), answer: 'Quotidiennement' } });
  await prisma.quiz.create({ data: { lessonId: lessonsBloc3[2].id, question: 'Quelle convention internationale réglemente le commerce des espèces sauvages ?', options: JSON.stringify(['CITES (Convention de Washington)', 'Convention de Berne', 'Protocole de Kyoto', 'Convention de Ramsar']), answer: 'CITES (Convention de Washington)' } });
  console.log('✅ Formation RNCP "Soigneur Animalier" créée (4 blocs, 13 leçons, 4 quiz)');

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

  // Feuille d'émargement — Session 1
  await prisma.attendanceSheet.create({
    data: { cohortId: cohorteCCAND.id, sessionDate: new Date('2025-10-06'), sessionTitle: 'Session 1 — Introduction et présentation de la LFTG', duration: 420 },
  });

  // Notes pédagogiques de la formatrice Elodie TRANQUARD
  await prisma.learnerNote.create({ data: { enrollmentId: enrollments[0].id, authorId: elodie.id, content: 'Lucas montre un excellent sens de l\'observation. Très à l\'aise avec les manipulations animales. À encourager dans la rédaction des comptes-rendus quotidiens.', type: 'OBSERVATION', isPrivate: false } });
  await prisma.learnerNote.create({ data: { enrollmentId: enrollments[1].id, authorId: elodie.id, content: 'Camille est très motivée et assidue. Quelques difficultés sur les protocoles sanitaires à revoir lors de la prochaine session pratique.', type: 'BILAN', isPrivate: false } });
  await prisma.learnerNote.create({ data: { enrollmentId: enrollments[2].id, authorId: elodie.id, content: 'Théo progresse bien. A réussi tous les quiz du Bloc 1. Prêt pour les évaluations pratiques du Bloc 2.', type: 'ENCOURAGEMENT', isPrivate: false } });
  console.log('✅ Cohorte CCAND-EGG 2025-2026 créée (5 apprenants, émargement, notes pédagogiques)');

  console.log('\n🎉 Seed v16.0.0 terminé avec succès !');
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
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
