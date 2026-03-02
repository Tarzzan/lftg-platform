import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LFTG Platform database v15.0.0...');

  // ─── Nettoyage ────────────────────────────────────────────────────────────
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.species.deleteMany({});
  await prisma.enclosure.deleteMany({});

  // ─── Permissions complètes ────────────────────────────────────────────────
  // Permission super-admin
  await prisma.permission.create({
    data: { id: 'manage_all', action: 'manage', subject: 'all', description: 'Accès total à toute la plateforme' },
  });

  // Permissions Animaux
  await prisma.permission.create({ data: { id: 'read_Animal', action: 'read', subject: 'Animal', description: 'Voir les animaux' } });
  await prisma.permission.create({ data: { id: 'create_Animal', action: 'create', subject: 'Animal', description: 'Créer des animaux' } });
  await prisma.permission.create({ data: { id: 'update_Animal', action: 'update', subject: 'Animal', description: 'Modifier des animaux' } });
  await prisma.permission.create({ data: { id: 'delete_Animal', action: 'delete', subject: 'Animal', description: 'Supprimer des animaux' } });
  await prisma.permission.create({ data: { id: 'manage_Animal', action: 'manage', subject: 'Animal', description: 'Gérer tous les animaux' } });

  // Permissions Enclos
  await prisma.permission.create({ data: { id: 'read_Enclosure', action: 'read', subject: 'Enclosure', description: 'Voir les enclos' } });
  await prisma.permission.create({ data: { id: 'manage_Enclosure', action: 'manage', subject: 'Enclosure', description: 'Gérer les enclos' } });

  // Permissions Stock
  await prisma.permission.create({ data: { id: 'read_Stock', action: 'read', subject: 'Stock', description: 'Voir le stock' } });
  await prisma.permission.create({ data: { id: 'create_Stock', action: 'create', subject: 'Stock', description: 'Créer des articles de stock' } });
  await prisma.permission.create({ data: { id: 'update_Stock', action: 'update', subject: 'Stock', description: 'Modifier le stock' } });
  await prisma.permission.create({ data: { id: 'manage_Stock', action: 'manage', subject: 'Stock', description: 'Gérer tout le stock' } });

  // Permissions Personnel
  await prisma.permission.create({ data: { id: 'read_Personnel', action: 'read', subject: 'Personnel', description: 'Voir le personnel' } });
  await prisma.permission.create({ data: { id: 'manage_Personnel', action: 'manage', subject: 'Personnel', description: 'Gérer le personnel' } });

  // Permissions Formation
  await prisma.permission.create({ data: { id: 'read_Formation', action: 'read', subject: 'Formation', description: 'Voir les formations' } });
  await prisma.permission.create({ data: { id: 'manage_Formation', action: 'manage', subject: 'Formation', description: 'Gérer les formations' } });

  // Permissions Médical
  await prisma.permission.create({ data: { id: 'read_Medical', action: 'read', subject: 'Medical', description: 'Voir les dossiers médicaux' } });
  await prisma.permission.create({ data: { id: 'manage_Medical', action: 'manage', subject: 'Medical', description: 'Gérer les dossiers médicaux' } });

  // Permissions Workflow
  await prisma.permission.create({ data: { id: 'read_Workflow', action: 'read', subject: 'Workflow', description: 'Voir les workflows' } });
  await prisma.permission.create({ data: { id: 'manage_Workflow', action: 'manage', subject: 'Workflow', description: 'Gérer les workflows' } });

  // Permissions Utilisateurs
  await prisma.permission.create({ data: { id: 'read_User', action: 'read', subject: 'User', description: 'Voir les utilisateurs' } });
  await prisma.permission.create({ data: { id: 'manage_User', action: 'manage', subject: 'User', description: 'Gérer les utilisateurs' } });

  console.log('✅ Permissions créées');

  // ─── Rôles ────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrateur de la plateforme — accès total',
      permissions: { connect: [{ id: 'manage_all' }] },
    },
  });

  const soigneurRole = await prisma.role.create({
    data: {
      name: 'soigneur',
      description: 'Soigneur animalier — gestion des animaux et médical',
      permissions: {
        connect: [
          { id: 'read_Animal' },
          { id: 'create_Animal' },
          { id: 'update_Animal' },
          { id: 'manage_Animal' },
          { id: 'read_Enclosure' },
          { id: 'read_Medical' },
          { id: 'manage_Medical' },
          { id: 'read_Workflow' },
        ],
      },
    },
  });

  const gestionnaireRole = await prisma.role.create({
    data: {
      name: 'gestionnaire',
      description: 'Gestionnaire de stock — gestion du stock et personnel',
      permissions: {
        connect: [
          { id: 'read_Animal' },
          { id: 'read_Enclosure' },
          { id: 'read_Stock' },
          { id: 'create_Stock' },
          { id: 'update_Stock' },
          { id: 'manage_Stock' },
          { id: 'read_Personnel' },
          { id: 'read_Formation' },
          { id: 'read_Workflow' },
          { id: 'manage_Workflow' },
        ],
      },
    },
  });

  const visiteurRole = await prisma.role.create({
    data: {
      name: 'visiteur',
      description: 'Visiteur — accès en lecture seule',
      permissions: {
        connect: [
          { id: 'read_Animal' },
          { id: 'read_Enclosure' },
          { id: 'read_Formation' },
        ],
      },
    },
  });

  console.log('✅ Rôles créés (admin, soigneur, gestionnaire, visiteur)');

  // ─── Utilisateurs ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  await prisma.user.create({
    data: {
      email: 'admin@lftg.fr',
      name: 'William MERI',
      password: adminPassword,
      roles: { connect: [{ name: 'admin' }] },
    },
  });

  await prisma.user.create({
    data: {
      email: 'soigneur@lftg.fr',
      name: 'Marie Dupont',
      password: userPassword,
      roles: { connect: [{ name: 'soigneur' }] },
    },
  });

  await prisma.user.create({
    data: {
      email: 'gestionnaire@lftg.fr',
      name: 'Jean Martin',
      password: userPassword,
      roles: { connect: [{ name: 'gestionnaire' }] },
    },
  });

  console.log('✅ Utilisateurs créés (admin, soigneur, gestionnaire)');

  // ─── Espèces ──────────────────────────────────────────────────────────────
  const species = await Promise.all([
    prisma.species.create({ data: { name: 'Ara chloroptère', scientificName: 'Ara chloropterus' } }),
    prisma.species.create({ data: { name: 'Caïman noir', scientificName: 'Melanosuchus niger' } }),
    prisma.species.create({ data: { name: 'Tortue matamata', scientificName: 'Chelus fimbriata' } }),
    prisma.species.create({ data: { name: 'Anaconda vert', scientificName: 'Eunectes murinus' } }),
    prisma.species.create({ data: { name: 'Toucan toco', scientificName: 'Ramphastos toco' } }),
  ]);
  console.log('✅ Espèces créées');

  // ─── Enclos ───────────────────────────────────────────────────────────────
  const enclosures = await Promise.all([
    prisma.enclosure.create({ data: { name: 'Volière tropicale', capacity: 20 } }),
    prisma.enclosure.create({ data: { name: 'Bassin reptiles', capacity: 5 } }),
    prisma.enclosure.create({ data: { name: 'Terrarium serpents', capacity: 8 } }),
    prisma.enclosure.create({ data: { name: 'Bassin tortues', capacity: 10 } }),
  ]);
  console.log('✅ Enclos créés');

  // ─── Animaux (50+) ────────────────────────────────────────────────────────
  for (let i = 0; i < 50; i++) {
    await prisma.animal.create({
      data: {
        identifier: `ANI-${String(i + 1).padStart(3, '0')}`,
        name: faker.person.firstName(),
        speciesId: species[i % species.length].id,
        enclosureId: enclosures[i % enclosures.length].id,
        sex: faker.helpers.arrayElement(['male', 'female']),
        birthDate: faker.date.past({ years: 10 }),
      },
    });
  }
  console.log('✅ 50 animaux créés');

  // ─── Couvées (10+) ────────────────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    await prisma.brood.create({
      data: {
        speciesId: species[i % species.length].id,
        incubationStartDate: faker.date.past({ years: 2 }),
        expectedHatchDate: faker.date.future({ years: 1 }),
        eggCount: faker.number.int({ min: 2, max: 12 }),
        status: 'INCUBATION',
      },
    });
  }
  console.log('✅ 10 couvées créées');

  // ─── Plans de nutrition ───────────────────────────────────────────────────
  for (const s of species) {
    await prisma.nutritionPlan.create({
      data: {
        speciesId: s.id,
        name: `Plan standard pour ${s.name}`,
        description: `Régime alimentaire équilibré pour ${s.name}.`,
      },
    });
  }
  console.log('✅ Plans de nutrition créés');

  // ─── Balises GPS ──────────────────────────────────────────────────────────
  const allAnimals = await prisma.animal.findMany();
  for (let i = 0; i < 15; i++) {
    await prisma.gpsDevice.create({
      data: {
        animalId: allAnimals[i].id,
        deviceId: `GPS-${faker.string.alphanumeric(8).toUpperCase()}`,
        battery: faker.number.float({ min: 0.1, max: 1.0, fractionDigits: 2 }),
      },
    });
  }
  console.log('✅ 15 balises GPS créées');

  // ─── Sites ────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.site.create({ data: { name: 'Ferme principale (Guyane)', location: 'Cayenne, Guyane Française' } }),
    prisma.site.create({ data: { name: 'Annexe (Martinique)', location: 'Fort-de-France, Martinique' } }),
  ]);
  console.log('✅ Sites créés');

  console.log('\n🎉 Seed v15.0.0 terminé avec succès !');
  console.log('\n📋 Comptes disponibles :');
  console.log('  admin@lftg.fr       / Admin1234!  → Administrateur');
  console.log('  soigneur@lftg.fr    / User1234!   → Soigneur animalier');
  console.log('  gestionnaire@lftg.fr / User1234!  → Gestionnaire de stock');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
