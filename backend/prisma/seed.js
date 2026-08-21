const { PrismaClient, Role, ListingStatus } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test data...");

  // 1. Landlord
  const landlord = await prisma.user.upsert({
    where: {
      email: "landlord@test.com",
    },
    update: {},
    create: {
      fullName: "Test Landlord",
      email: "landlord@test.com",
      passwordHash: "test-password",
      role: Role.LANDLORD,
      phone: "0911111111",
    },
  });

  // 2. Category
  const category = await prisma.category.upsert({
    where: {
      name: "Apartment",
    },
    update: {},
    create: {
      name: "Apartment",
      description: "Modern apartment",
    },
  });

  // 3. Location
  const location = await prisma.location.create({
    data: {
      city: "Addis Ababa",
      subCity: "Bole",
      kebeleOrWoreda: "03",
      region: "Addis Ababa",
    },
  });

  // 4. Approved Property
  const property = await prisma.property.create({
    data: {
      titleEn: "Modern Apartment in Bole",
      titleAm: "በቦሌ የሚገኝ ዘመናዊ አፓርታማ",
      descriptionEn:
        "Beautiful and modern apartment available for rent.",
      descriptionAm:
        "ዘመናዊና ምቹ አፓርታማ ለኪራይ ይገኛል።",
      price: 15000,
      rooms: 3,
      furnished: true,
      landmarkDescription: "Near Bole Medhanialem",
      gpsLat: 8.9806,
      gpsLng: 38.7578,
      status: ListingStatus.APPROVED,
      publishedAt: new Date(),

      landlordId: landlord.id,
      categoryId: category.id,
      locationId: location.id,
    },
  });

  console.log("✅ Test property created:");
  console.log(property);
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });