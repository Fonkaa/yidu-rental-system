const prisma = require('../prisma/client');
const { notifyUser } = require('../services/notificationService');

async function getPendingProperties(req, res) {
  try {
    const pending = await prisma.property.findMany({
      where: { status: 'PENDING' },
      include: {
        landlord: { select: { fullName: true, email: true } },
        category: true,
        location: true,
        images: true,
      },
    });
    res.json(pending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching pending properties' });
  }
}

async function approveProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: 'APPROVED',
        publishedAt: new Date(),
      },
    });

    await notifyUser(
      property.landlordId,
      'LISTING_APPROVED',
      'Listing Approved ✅',
      `Your listing "${property.titleEn}" has been approved and is now live.`,
      'Property',
      property.id
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong approving the property' });
  }
}

async function rejectProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await notifyUser(
      property.landlordId,
      'LISTING_REJECTED',
      'Listing Rejected',
      `Your listing "${property.titleEn}" was rejected. Please review and resubmit.`,
      'Property',
      property.id
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong rejecting the property' });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching users' });
  }
}

async function toggleUserActive(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, fullName: true, email: true, isActive: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the user' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });

    return res.json({ success: true, user: updated });
  } catch (error) {
    console.error('UPDATE USER ROLE ERROR:', error);
    return res.status(500).json({ error: 'Something went wrong updating the user role' });
  }
}

async function createRole(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const newRole = await prisma.role.create({
      data: { name: name.toUpperCase() },
    });

    return res.status(201).json({ success: true, role: newRole });
  } catch (error) {
    console.error('CREATE ROLE ERROR:', error);
    return res.status(500).json({ error: 'Failed to create role. It may already exist.' });
  }
}

async function getPaymentsSummary(req, res) {
  try {
    const successfulPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      include: {
        lease: {
          include: {
            tenant: { select: { fullName: true } },
            property: { select: { titleEn: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    const totalVolume = successfulPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalRevenue = totalVolume * 0.10;

    const recentPayments = successfulPayments.map(p => ({
      tenantName: p.lease?.tenant?.fullName || p.email || 'Verified Tenant',
      propertyName: p.lease?.property?.titleEn || 'Lease Property',
      txRef: p.gatewayTransactionId || p.txRef || `TX-CHAPA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount: Number(p.amount || 0),
      createdAt: p.createdAt,
    }));

    const [availableProps, rentedProps, approvedProps, rejectedProps, pendingProps, totalRequests] = await Promise.all([
      prisma.property.count({ where: { status: 'APPROVED' } }).catch(() => 0),
      prisma.property.count({ where: { status: 'RENTED' } }).catch(() => 0),
      prisma.property.count({ where: { status: 'APPROVED' } }).catch(() => 0),
      prisma.property.count({ where: { status: 'REJECTED' } }).catch(() => 0),
      prisma.property.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.rentalRequest.count().catch(() => 0),
    ]);

    return res.status(200).json({
      success: true,
      paymentsData: {
        totalRevenue,
        totalVolume,
        recentPayments,
      },
      propertyStats: {
        available: availableProps,
        rented: rentedProps,
        approved: approvedProps,
        rejected: rejectedProps,
        pending: pendingProps,
        requested: totalRequests,
      }
    });
  } catch (error) {
    console.error('GET PAYMENTS SUMMARY ERROR:', error);
    return res.status(0).json({ error: 'Something went wrong fetching payments summary' });
  }
}

module.exports = {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  toggleUserActive,
  updateUserRole,
  createRole,
  getPaymentsSummary,
};