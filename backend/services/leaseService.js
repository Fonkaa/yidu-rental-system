const prisma = require('../prisma/client');

async function createLeaseFromRequest({ rentalRequestId, landlordId, tenantId, propertyId, monthlyRent, startDate, endDate }) {
  if (!rentalRequestId || !landlordId || !tenantId || !propertyId || !monthlyRent || !startDate) {
    throw new Error('rentalRequestId, landlordId, tenantId, propertyId, monthlyRent, and startDate are required');
  }

  const request = await prisma.rentalRequest.findUnique({ where: { id: rentalRequestId } });
  if (!request) {
    throw new Error('RENTAL_REQUEST_NOT_FOUND');
  }

  if (request.status !== 'APPROVED') {
    throw new Error('Only approved rental requests can create a lease');
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // 1. Check if a lease already exists for this exact rentalRequest or property/tenant combination
  let lease = await prisma.lease.findFirst({
    where: {
      OR: [
        { rentalRequestId },
        { propertyId, tenantId, status: 'ACTIVE' }
      ]
    }
  });

  if (lease) {
    // If it exists, UPDATE it cleanly instead of duplicating rows
    lease = await prisma.lease.update({
      where: { id: lease.id },
      data: {
        rentalRequestId,
        landlordId,
        tenantId,
        propertyId,
        monthlyRent: Number(monthlyRent),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status: 'ACTIVE',
      },
      include: {
        property: {
          include: {
            location: true,
            images: true,
          }
        },
        tenant: { select: { id: true, fullName: true, email: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        rentalRequest: true,
      },
    });
  } else {
    // Otherwise, create the active lease safely
    lease = await prisma.lease.create({
      data: {
        rentalRequestId,
        landlordId,
        tenantId,
        propertyId,
        monthlyRent: Number(monthlyRent),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status: 'ACTIVE',
      },
      include: {
        property: {
          include: {
            location: true,
            images: true,
          }
        },
        tenant: { select: { id: true, fullName: true, email: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        rentalRequest: true,
      },
    });
  }

  // 2. Automatically mark the property as RENTED so it updates everywhere
  await prisma.property.update({
    where: { id: propertyId },
    data: { status: 'RENTED' }
  }).catch(() => {});

  return lease;
}

async function getLeasesForUser(userId, role) {
  // --- AUTO-RELEASE EXPIRED LEASES BEFORE FETCHING ---
  const now = new Date();
  const expiredLeases = await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lte: now }
    }
  }).catch(() => []);

  if (expiredLeases.length > 0) {
    const propertyIdsToRelease = expiredLeases.map(l => l.propertyId);
    
    // Mark leases as EXPIRED
    await prisma.lease.updateMany({
      where: { id: { in: expiredLeases.map(l => l.id) } },
      data: { status: 'EXPIRED' }
    });

    // Release properties back to APPROVED (Available) globally
    await prisma.property.updateMany({
      where: { id: { in: propertyIdsToRelease } },
      data: { status: 'APPROVED' }
    });
  }

  const where = role === 'LANDLORD'
    ? { landlordId: userId }
    : { tenantId: userId };

  const rawLeases = await prisma.lease.findMany({
    where,
    include: {
      property: {
        include: {
          location: true,
          images: true,
        }
      },
      tenant: { select: { id: true, fullName: true, email: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
      rentalRequest: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ensure strict unique lease ID representation to prevent any relation duplicate joins
  const uniqueLeaseMap = new Map();
  rawLeases.forEach((l) => {
    if (!uniqueLeaseMap.has(l.id)) {
      uniqueLeaseMap.set(l.id, l);
    }
  });

  return Array.from(uniqueLeaseMap.values());
}

async function updateLeaseStatus(id, userId, role, status) {
  const lease = await prisma.lease.findUnique({ where: { id } });
  if (!lease) {
    throw new Error('LEASE_NOT_FOUND');
  }

  if (role === 'LANDLORD' && lease.landlordId !== userId) {
    throw new Error('FORBIDDEN');
  }

  if (role === 'TENANT' && lease.tenantId !== userId) {
    throw new Error('FORBIDDEN');
  }

  const updatedLease = await prisma.lease.update({
    where: { id },
    data: { status },
    include: {
      property: {
        include: {
          location: true,
          images: true,
        }
      },
      tenant: { select: { id: true, fullName: true, email: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
    },
  });

  // If status is changed to EXPIRED, COMPLETED, or CANCELLED, release the property back to APPROVED
  if (status === 'EXPIRED' || status === 'COMPLETED' || status === 'CANCELLED') {
    await prisma.property.update({
      where: { id: lease.propertyId },
      data: { status: 'APPROVED' }
    }).catch(() => {});
  }

  return updatedLease;
}

module.exports = {
  createLeaseFromRequest,
  getLeasesForUser,
  updateLeaseStatus,
};