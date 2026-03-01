import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LFTG Platform database...');

  // ─── Permissions ─────────────────────────────────────────────────────────
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.species.deleteMany({});
  await prisma.enclosure.deleteMany({});

  const permissions = await Promise.all([
    prisma.permission.create({ data: { id: 'manage_all', action: 'manage', subject: 'all', description: 'Accès total' } }),
    prisma.permission.create({ data: { id: 'read_Animal', action: 'read', subject: 'Animal' } }),
    prisma.permission.create({ data: { id: 'manage_Animal', action: 'manage', subject: 'Animal' } }),
  ]);

  // ─── Roles ────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrateur de la plateforme',
      permissions: { connect: [{ id: 'manage_all' }] },
    },
  });

  const soigneurRole = await prisma.role.create({
    data: {
      name: 'soigneur',
      description: 'Soigneur animalier',
      permissions: { connect: [{ id: 'read_Animal' }, { id: 'manage_Animal' }] },
    },
  });

  console.log('✅ Rôles créés');

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lftg.fr',
      name: 'William MERI',
      password: adminPassword,
      roles: { connect: [{ name: 'admin' }] },
    },
  });

  const soigneurUser = await prisma.user.create({
    data: {
      email: 'soigneur@lftg.fr',
      name: 'Marie Dupont',
      password: userPassword,
      roles: { connect: [{ name: 'soigneur' }] },
    },
  });

  console.log('✅ Utilisateurs créés');

  // ─── Species ──────────────────────────────────────────────────────────────
  const species = await Promise.all([
    prisma.species.create({ data: { name: 'Ara chloroptère', scientificName: 'Ara chloropterus' } }),
    prisma.species.create({ data: { name: 'Caïman noir', scientificName: 'Melanosuchus niger' } }),
    prisma.species.create({ data: { name: 'Tortue matamata', scientificName: 'Chelus fimbriata' } }),
  ]);
  console.log('✅ Espèces créées');

  // ─── Enclosures ───────────────────────────────────────────────────────────
  const enclosures = await Promise.all([
    prisma.enclosure.create({ data: { name: 'Volière tropicale', capacity: 20 } }),
    prisma.enclosure.create({ data: { name: 'Bassin reptiles', capacity: 5 } }),
  ]);
  console.log('✅ Enclos créés');

  // ─── Animals (50+) ───────────────────────────────────────────────────
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

  // ─── Broods (10+) ───────────────────────────────────────────────────
  const allAnimals = await prisma.animal.findMany();
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

  // ─── Nutrition Plans ───────────────────────────────────────────────────
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

  // ─── GPS Devices ───────────────────────────────────────────────────
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

  // ─── Sites ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.site.create({ data: { name: 'Ferme principale (Guyane)', location: 'Cayenne, Guyane Française' } }),
    prisma.site.create({ data: { name: 'Annexe (Martinique)', location: 'Fort-de-France, Martinique' } }),
  ]);
  console.log('✅ Sites créés');

  console.log('\n🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
