const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================================
  // 12 PROPERTY CATEGORIES
  // ============================================================

  const categories = [
    {
      name: "Apartment",
      description: "Modern apartment properties",
    },
    {
      name: "House",
      description: "Residential houses",
    },
    {
      name: "Villa",
      description: "Luxury and standalone villas",
    },
    {
      name: "Condominium",
      description: "Condominium properties",
    },
    {
      name: "Studio",
      description: "Small studio apartments",
    },
    {
      name: "Bedsitter",
      description: "Single-room residential units",
    },
    {
      name: "Guest House",
      description: "Guest houses and short-term accommodation",
    },
    {
      name: "Duplex",
      description: "Two-level residential properties",
    },
    {
      name: "Office",
      description: "Office and commercial workspace",
    },
    {
      name: "Shop",
      description: "Retail and shop properties",
    },
    {
      name: "Warehouse",
      description: "Storage and warehouse properties",
    },
    {
      name: "Land",
      description: "Residential or commercial land",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
      },
      create: {
        name: category.name,
        description: category.description,
      },
    });
  }

  console.log("✅ 12 categories added.");

  // ============================================================
  // ADDIS ABABA SUB-CITIES
  // ============================================================

  const subCities = [
    "Addis Ketema",
    "Akaki Kaliti",
    "Arada",
    "Bole",
    "Gullele",
    "Kirkos",
    "Kolfe Keranio",
    "Lemi Kura",
    "Lideta",
    "Nifas Silk-Lafto",
    "Yeka",
  ];

  for (const subCity of subCities) {
    const existingLocation =
      await prisma.location.findFirst({
        where: {
          city: "Addis Ababa",
          subCity: subCity,
        },
      });

    if (!existingLocation) {
      await prisma.location.create({
        data: {
          city: "Addis Ababa",
          subCity: subCity,
          region: "Addis Ababa",
        },
      });
    }
  }

  console.log("✅ Addis Ababa sub-cities added.");

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });