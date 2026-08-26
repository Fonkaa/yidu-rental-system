const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories and locations...');

  // 1. Categories
  const categories = ['Villa', 'Apartment', 'House'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { id: name.toLowerCase() },
      update: {},
      create: { id: name.toLowerCase(), name },
    });
  }

  // 2. Addis Ababa Sub-cities
  const subCities = [
    'Addis Ketema',
    'Akaky Kaliti',
    'Arada',
    'Bole',
    'Gullele',
    'Kirkos',
    'Kolfe Keranio',
    'Lemi Kura',
    'Lideta',
    'Nifas Silk-Lafto',
    'Yeka',
  ];

  for (const subCity of subCities) {
    const id = subCity.toLowerCase().replace(/[^a-z]/g, '');
    await prisma.location.upsert({
      where: { id },
      update: {},
      create: { id, city: 'Addis Ababa', subCity },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });