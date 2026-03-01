import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LFTG Platform database...');

  // ─── Permissions ─────────────────────────────────────────────────────────
  const permissions = await Promise.all([
    prisma.permission.upsert({ where: { id: 'manage_all' }, update: {}, create: { id: 'manage_all', action: 'manage', subject: 'all', description: 'Accès total' } }),
    prisma.permission.upsert({ where: { id: 'read_Animal' }, update: {}, create: { id: 'read_Animal', action: 'read', subject: 'Animal' } }),
    prisma.permission.upsert({ where: { id: 'manage_Animal' }, update: {}, create: { id: 'manage_Animal', action: 'manage', subject: 'Animal' } }),
    prisma.permission.upsert({ where: { id: 'read_StockItem' }, update: {}, create: { id: 'read_StockItem', action: 'read', subject: 'StockItem' } }),
    prisma.permission.upsert({ where: { id: 'manage_StockItem' }, update: {}, create: { id: 'manage_StockItem', action: 'manage', subject: 'StockItem' } }),
    prisma.permission.upsert({ where: { id: 'read_Employee' }, update: {}, create: { id: 'read_Employee', action: 'read', subject: 'Employee' } }),
    prisma.permission.upsert({ where: { id: 'manage_Employee' }, update: {}, create: { id: 'manage_Employee', action: 'manage', subject: 'Employee' } }),
    prisma.permission.upsert({ where: { id: 'read_Course' }, update: {}, create: { id: 'read_Course', action: 'read', subject: 'Course' } }),
    prisma.permission.upsert({ where: { id: 'manage_Course' }, update: {}, create: { id: 'manage_Course', action: 'manage', subject: 'Course' } }),
  ]);

  // ─── Roles ────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrateur de la plateforme',
      permissions: { connect: [{ id: 'manage_all' }] },
    },
  });

  const soigneurRole = await prisma.role.upsert({
    where: { name: 'soigneur' },
    update: {},
    create: {
      name: 'soigneur',
      description: 'Soigneur animalier',
      permissions: { connect: [{ id: 'read_Animal' }, { id: 'manage_Animal' }] },
    },
  });

  const gestionnaireRole = await prisma.role.upsert({
    where: { name: 'gestionnaire' },
    update: {},
    create: {
      name: 'gestionnaire',
      description: 'Gestionnaire de stock',
      permissions: { connect: [{ id: 'read_StockItem' }, { id: 'manage_StockItem' }] },
    },
  });

  const rhRole = await prisma.role.upsert({
    where: { name: 'rh' },
    update: {},
    create: {
      name: 'rh',
      description: 'Responsable RH',
      permissions: { connect: [{ id: 'read_Employee' }, { id: 'manage_Employee' }] },
    },
  });

  const formateurRole = await prisma.role.upsert({
    where: { name: 'formateur' },
    update: {},
    create: {
      name: 'formateur',
      description: 'Formateur',
      permissions: { connect: [{ id: 'read_Course' }, { id: 'manage_Course' }] },
    },
  });

  const employeRole = await prisma.role.upsert({
    where: { name: 'employe' },
    update: {},
    create: {
      name: 'employe',
      description: 'Employé',
      permissions: { connect: [{ id: 'read_Animal' }, { id: 'read_StockItem' }, { id: 'read_Course' }] },
    },
  });

  console.log('✅ Rôles créés:', [adminRole, soigneurRole, gestionnaireRole, rhRole, formateurRole, employeRole].map(r => r.name).join(', '));

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lftg.fr' },
    update: {},
    create: {
      email: 'admin@lftg.fr',
      name: 'William MERI',
      password: adminPassword,
      roles: { connect: [{ name: 'admin' }] },
    },
  });

  const soigneurUser = await prisma.user.upsert({
    where: { email: 'soigneur@lftg.fr' },
    update: {},
    create: {
      email: 'soigneur@lftg.fr',
      name: 'Marie Dupont',
      password: userPassword,
      roles: { connect: [{ name: 'soigneur' }] },
    },
  });

  const gestionnaireUser = await prisma.user.upsert({
    where: { email: 'gestionnaire@lftg.fr' },
    update: {},
    create: {
      email: 'gestionnaire@lftg.fr',
      name: 'Jean Martin',
      password: userPassword,
      roles: { connect: [{ name: 'gestionnaire' }] },
    },
  });

  console.log('✅ Utilisateurs créés:', [adminUser, soigneurUser, gestionnaireUser].map(u => u.email).join(', '));

  // ─── Workflow Definitions ─────────────────────────────────────────────────
  const stockWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Demande de sortie stock' },
    update: {},
    create: {
      name: 'Demande de sortie stock',
      entityType: 'StockRequest',
      description: 'Workflow de validation des demandes de sortie de stock',
      states: {
        draft: { type: 'initial', label: 'Brouillon' },
        pending: { label: 'En attente de validation' },
        approved: { type: 'final', label: 'Approuvé' },
        rejected: { type: 'final', label: 'Rejeté' },
      },
      transitions: {
        submit: { from: 'draft', to: 'pending', label: 'Soumettre', roles: ['employe', 'admin'] },
        approve: { from: 'pending', to: 'approved', label: 'Approuver', roles: ['gestionnaire', 'admin'] },
        reject: { from: 'pending', to: 'rejected', label: 'Rejeter', roles: ['gestionnaire', 'admin'] },
        revise: { from: 'rejected', to: 'draft', label: 'Réviser', roles: ['employe', 'admin'] },
      },
      formSchema: {
        fields: [
          { name: 'reason', type: 'textarea', label: 'Motif de la demande', required: true },
          { name: 'urgency', type: 'select', label: 'Urgence', options: ['normale', 'urgente', 'critique'] },
        ],
      },
    },
  });

  const healthWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Rapport sanitaire animal' },
    update: {},
    create: {
      name: 'Rapport sanitaire animal',
      entityType: 'AnimalHealthReport',
      description: 'Workflow de suivi sanitaire des animaux',
      states: {
        open: { type: 'initial', label: 'Ouvert' },
        in_review: { label: 'En cours d\'examen' },
        treated: { label: 'Traité' },
        closed: { type: 'final', label: 'Clôturé' },
      },
      transitions: {
        review: { from: 'open', to: 'in_review', label: 'Prendre en charge' },
        treat: { from: 'in_review', to: 'treated', label: 'Traitement appliqué' },
        close: { from: 'treated', to: 'closed', label: 'Clôturer' },
        reopen: { from: 'closed', to: 'open', label: 'Réouvrir' },
      },
    },
  });

  console.log('✅ Workflows créés:', [stockWorkflow, healthWorkflow].map(w => w.name).join(', '));

  // ─── Species ──────────────────────────────────────────────────────────────
  const species = await Promise.all([
    prisma.species.upsert({ where: { name: 'Ara chloroptère' }, update: {}, create: { name: 'Ara chloroptère', scientificName: 'Ara chloropterus', description: 'Grand perroquet de Guyane' } }),
    prisma.species.upsert({ where: { name: 'Caïman noir' }, update: {}, create: { name: 'Caïman noir', scientificName: 'Melanosuchus niger', description: 'Grand crocodilien d\'Amazonie' } }),
    prisma.species.upsert({ where: { name: 'Tortue matamata' }, update: {}, create: { name: 'Tortue matamata', scientificName: 'Chelus fimbriata', description: 'Tortue aquatique unique' } }),
    prisma.species.upsert({ where: { name: 'Tapir de Baird' }, update: {}, create: { name: 'Tapir de Baird', scientificName: 'Tapirus bairdii', description: 'Mammifère herbivore' } }),
    prisma.species.upsert({ where: { name: 'Anaconda vert' }, update: {}, create: { name: 'Anaconda vert', scientificName: 'Eunectes murinus', description: 'Plus grand serpent du monde' } }),
  ]);

  console.log('✅ Espèces créées:', species.map(s => s.name).join(', '));

  // ─── Enclosures ───────────────────────────────────────────────────────────
  const enclosures = await Promise.all([
    prisma.enclosure.upsert({ where: { name: 'Volière tropicale' }, update: {}, create: { name: 'Volière tropicale', description: 'Grande volière pour les oiseaux', capacity: 20 } }),
    prisma.enclosure.upsert({ where: { name: 'Bassin reptiles' }, update: {}, create: { name: 'Bassin reptiles', description: 'Bassin pour les reptiles aquatiques', capacity: 5 } }),
    prisma.enclosure.upsert({ where: { name: 'Enclos mammifères' }, update: {}, create: { name: 'Enclos mammifères', description: 'Espace pour les grands mammifères', capacity: 3 } }),
  ]);

  console.log('✅ Enclos créés:', enclosures.map(e => e.name).join(', '));

  // ─── Animals ──────────────────────────────────────────────────────────────
  const animals = await Promise.all([
    prisma.animal.upsert({ where: { identifier: 'ARA-001' }, update: {}, create: { identifier: 'ARA-001', speciesId: species[0].id, enclosureId: enclosures[0].id, sex: 'male', birthDate: new Date('2020-03-15'), notes: 'Animal dominant de la volière' } }),
    prisma.animal.upsert({ where: { identifier: 'ARA-002' }, update: {}, create: { identifier: 'ARA-002', speciesId: species[0].id, enclosureId: enclosures[0].id, sex: 'female', birthDate: new Date('2021-06-20') } }),
    prisma.animal.upsert({ where: { identifier: 'CAI-001' }, update: {}, create: { identifier: 'CAI-001', speciesId: species[1].id, enclosureId: enclosures[1].id, sex: 'male', birthDate: new Date('2018-01-10'), notes: 'Spécimen adulte' } }),
    prisma.animal.upsert({ where: { identifier: 'TAP-001' }, update: {}, create: { identifier: 'TAP-001', speciesId: species[3].id, enclosureId: enclosures[2].id, sex: 'female', birthDate: new Date('2019-08-05') } }),
  ]);

  console.log('✅ Animaux créés:', animals.map(a => a.identifier).join(', '));

  // ─── Broods ───────────────────────────────────────────────────────────────
  const broods = await Promise.all([
    prisma.brood.create({ data: { speciesId: species[0].id, incubationStartDate: new Date('2026-01-15'), expectedHatchDate: new Date('2026-03-15'), eggCount: 3, status: 'incubating', notes: 'Première couvée de l\'année' } }),
    prisma.brood.create({ data: { speciesId: species[2].id, incubationStartDate: new Date('2025-11-01'), expectedHatchDate: new Date('2026-01-15'), hatchDate: new Date('2026-01-12'), eggCount: 8, hatchedCount: 6, status: 'hatched' } }),
  ]);

  console.log('✅ Couvées créées:', broods.length);

  // ─── Stock Items ──────────────────────────────────────────────────────────
  const stockItems = await Promise.all([
    prisma.stockItem.upsert({ where: { name: 'Granulés perroquets' }, update: {}, create: { name: 'Granulés perroquets', description: 'Alimentation complète pour psittacidés', quantity: 25, unit: 'kg', lowStockThreshold: 5 } }),
    prisma.stockItem.upsert({ where: { name: 'Poissons congelés' }, update: {}, create: { name: 'Poissons congelés', description: 'Alimentation pour reptiles aquatiques', quantity: 3, unit: 'kg', lowStockThreshold: 5 } }),
    prisma.stockItem.upsert({ where: { name: 'Foin tropical' }, update: {}, create: { name: 'Foin tropical', description: 'Fourrage pour herbivores', quantity: 80, unit: 'kg', lowStockThreshold: 20 } }),
    prisma.stockItem.upsert({ where: { name: 'Médicaments vétérinaires' }, update: {}, create: { name: 'Médicaments vétérinaires', description: 'Stock de médicaments généraux', quantity: 2, unit: 'unité', lowStockThreshold: 5 } }),
    prisma.stockItem.upsert({ where: { name: 'Désinfectant enclos' }, update: {}, create: { name: 'Désinfectant enclos', description: 'Produit de nettoyage et désinfection', quantity: 12, unit: 'litre', lowStockThreshold: 3 } }),
    prisma.stockItem.upsert({ where: { name: 'Substrat terrarium' }, update: {}, create: { name: 'Substrat terrarium', description: 'Substrat naturel pour terrariums', quantity: 50, unit: 'litre', lowStockThreshold: 10 } }),
  ]);

  console.log('✅ Articles stock créés:', stockItems.map(s => s.name).join(', '));

  // ─── Employees ────────────────────────────────────────────────────────────
  const emp1 = await prisma.employee.upsert({
    where: { userId: soigneurUser.id },
    update: {},
    create: {
      userId: soigneurUser.id,
      jobTitle: 'Soigneuse animalière',
      department: 'Animalerie',
      hireDate: new Date('2022-03-01'),
    },
  });

  const emp2 = await prisma.employee.upsert({
    where: { userId: gestionnaireUser.id },
    update: {},
    create: {
      userId: gestionnaireUser.id,
      jobTitle: 'Gestionnaire de stock',
      department: 'Logistique',
      hireDate: new Date('2021-09-15'),
    },
  });

  // Add skills
  const skills = await Promise.all([
    prisma.skill.upsert({ where: { name: 'Soins vétérinaires' }, update: {}, create: { name: 'Soins vétérinaires' } }),
    prisma.skill.upsert({ where: { name: 'Gestion de stock' }, update: {}, create: { name: 'Gestion de stock' } }),
    prisma.skill.upsert({ where: { name: 'Comportement animal' }, update: {}, create: { name: 'Comportement animal' } }),
  ]);

  await prisma.employee.update({ where: { id: emp1.id }, data: { skills: { connect: [{ id: skills[0].id }, { id: skills[2].id }] } } });
  await prisma.employee.update({ where: { id: emp2.id }, data: { skills: { connect: [{ id: skills[1].id }] } } });

  console.log('✅ Employés créés');

  // ─── Formation Course ─────────────────────────────────────────────────────
  const course = await prisma.course.create({
    data: {
      title: 'Introduction à la biodiversité guyanaise',
      description: 'Cours de découverte des espèces emblématiques de la forêt tropicale guyanaise',
      isPublished: true,
      chapters: {
        create: [
          {
            title: 'Chapitre 1 : La forêt tropicale',
            order: 1,
            lessons: {
              create: [
                { title: 'La canopée et ses habitants', content: 'La canopée est l\'étage supérieur de la forêt tropicale...', order: 1 },
                { title: 'Les espèces endémiques', content: 'La Guyane abrite de nombreuses espèces endémiques...', order: 2 },
              ],
            },
          },
          {
            title: 'Chapitre 2 : Les reptiles',
            order: 2,
            lessons: {
              create: [
                { title: 'Les caïmans de Guyane', content: 'La Guyane abrite plusieurs espèces de caïmans...', order: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Cours créé:', course.title);

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('\n📋 Comptes de test :');
  console.log('   Admin:        admin@lftg.fr       / Admin1234!');
  console.log('   Soigneur:     soigneur@lftg.fr    / User1234!');
  console.log('   Gestionnaire: gestionnaire@lftg.fr / User1234!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
