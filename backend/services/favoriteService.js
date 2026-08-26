const prisma = require('../prisma/client');

async function addFavorite(userId, propertyId) {
  if (!userId || !propertyId) {
    throw new Error('userId and propertyId are required');
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    throw new Error('PROPERTY_NOT_FOUND');
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
    include: {
      property: {
        include: {
          images: true,
          location: true,
          category: true,
        },
      },
    },
  });
}

async function listFavorites(userId) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: true,
          location: true,
          category: true,
          landlord: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function removeFavorite(userId, propertyId) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (!favorite) {
    return null;
  }

  return prisma.favorite.delete({
    where: {
      id: favorite.id,
    },
  });
}

module.exports = {
  addFavorite,
  listFavorites,
  removeFavorite,
};