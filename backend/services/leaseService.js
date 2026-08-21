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

  return prisma.lease.create({
    data: {
      rentalRequestId,
      landlordId,
      tenantId,
      propertyId,
      monthlyRent: Number(monthlyRent),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: 'ACTIVE',
    },
    include: {
      property: true,
      tenant: { select: { id: true, fullName: true, email: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
      rentalRequest: true,
    },
  });
}

async function getLeasesForUser(userId, role) {
  const where = role === 'LANDLORD'
    ? { landlordId: userId }
    : { tenantId: userId };

  return prisma.lease.findMany({
    where,
    include: {
      property: true,
      tenant: { select: { id: true, fullName: true, email: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
      rentalRequest: true,
    },
    orderBy: { createdAt: 'desc' },
  });
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

  return prisma.lease.update({
    where: { id },
    data: { status },
    include: {
      property: true,
      tenant: { select: { id: true, fullName: true, email: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
    },
  });
}

module.exports = {
  createLeaseFromRequest,
  getLeasesForUser,
  updateLeaseStatus,
};
