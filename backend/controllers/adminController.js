
const prisma = require('../prisma/client');
const { notifyUser } = require('../services/notificationService');

// ============================================================
// GET PENDING PROPERTIES
// ============================================================
async function getPendingProperties(req, res) {
  try {
    const pending = await prisma.property.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        category: true,
        location: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(pending);
  } catch (error) {
    console.error('GET PENDING PROPERTIES ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong fetching pending properties',
    });
  }
}

// ============================================================
// APPROVE PROPERTY
// ============================================================
async function approveProperty(req, res) {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          status: 'APPROVED',
          publishedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: property.landlordId,
          type: 'LISTING_APPROVED',
          title: 'Listing Approved ✅',
          message: `Your listing "${property.titleEn}" has been approved and is now live.`,
          relatedEntityType: 'Property',
          relatedEntityId: property.id,
        },
      });

      return updatedProperty;
    });

    return res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      property: updated,
    });
  } catch (error) {
    console.error('APPROVE PROPERTY ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong approving the property',
    });
  }
}

// ============================================================
// REJECT PROPERTY
// ============================================================
async function rejectProperty(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    const reason =
      rejectionReason?.trim() ||
      'Listing rejected by administrator.';

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });

      await tx.notification.create({
        data: {
          userId: property.landlordId,
          type: 'LISTING_REJECTED',
          title: 'Listing Rejected',
          message: `Your listing "${property.titleEn}" was rejected. Reason: ${reason}`,
          relatedEntityType: 'Property',
          relatedEntityId: property.id,
        },
      });

      return updatedProperty;
    });

    return res.status(200).json({
      success: true,
      message: 'Property rejected successfully',
      property: updated,
    });
  } catch (error) {
    console.error('REJECT PROPERTY ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong rejecting the property',
    });
  }
}

// ============================================================
// GET ALL USERS
// ============================================================
async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong fetching users',
    });
  }
}

// ============================================================
// ACTIVATE / DEACTIVATE USER
// USING PRISMA TRANSACTION
// ============================================================
async function toggleUserActive(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const currentAdminId =
      req.user?.id || req.user?.userId;

    // Prevent admin from disabling himself
    if (currentAdminId && currentAdminId === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own admin account',
      });
    }

    const newStatus = !user.isActive;

    // ========================================================
    // TRANSACTION
    // User update + notification happen together
    // ========================================================
    const updatedUser = await prisma.$transaction(
      async (tx) => {
        // 1. Update user status
        const updated = await tx.user.update({
          where: { id },
          data: {
            isActive: newStatus,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });

        // 2. Create notification
        await tx.notification.create({
          data: {
            userId: id,
            type: newStatus
              ? 'ACCOUNT_ACTIVATED'
              : 'ACCOUNT_DEACTIVATED',
            title: newStatus
              ? 'Account Activated'
              : 'Account Deactivated',
            message: newStatus
              ? 'Your account has been activated by an administrator.'
              : 'Your account has been deactivated by an administrator.',
          },
        });

        return updated;
      }
    );

    return res.status(200).json({
      success: true,
      message: newStatus
        ? 'User activated successfully'
        : 'User deactivated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('TOGGLE USER ACTIVE ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong updating the user',
    });
  }
}

// ============================================================
// UPDATE USER ROLE
// USING PRISMA TRANSACTION
// ============================================================
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required',
      });
    }

    const newRole = String(role).toUpperCase();

    // These are the exact Role enum values
    // from schema.prisma
    const allowedRoles = [
      'TENANT',
      'LANDLORD',
      'ADMIN',
    ];

    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid role. Allowed roles are TENANT, LANDLORD and ADMIN',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const currentAdminId =
      req.user?.id || req.user?.userId;

    // Prevent current admin from changing
    // his own ADMIN role
    if (
      currentAdminId &&
      currentAdminId === id &&
      user.role === 'ADMIN'
    ) {
      return res.status(400).json({
        success: false,
        error: 'You cannot change your own admin role',
      });
    }

    if (user.role === newRole) {
      return res.status(400).json({
        success: false,
        error: `User is already ${newRole}`,
      });
    }

    const oldRole = user.role;

    // ========================================================
    // TRANSACTION
    // User role update + notification
    // ========================================================
    const updatedUser = await prisma.$transaction(
      async (tx) => {
        // 1. Update role
        const updated = await tx.user.update({
          where: { id },
          data: {
            role: newRole,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });

        // 2. Create notification
        await tx.notification.create({
          data: {
            userId: id,
            type: 'ROLE_CHANGED',
            title: 'Account Role Updated',
            message: `Your account role has been changed from ${oldRole} to ${newRole} by an administrator.`,
          },
        });

        return updated;
      }
    );

    return res.status(200).json({
      success: true,
      message: `User role changed from ${oldRole} to ${newRole}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('UPDATE USER ROLE ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong updating the user role',
    });
  }
}

// ============================================================
// GET PAYMENTS SUMMARY
// ============================================================
async function getPaymentsSummary(req, res) {
  try {
    const successfulPayments =
      await prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
        },
        include: {
          lease: {
            include: {
              tenant: {
                select: {
                  fullName: true,
                },
              },
              property: {
                select: {
                  titleEn: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    const totalVolume =
      successfulPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const totalRevenue = totalVolume * 0.1;

    const recentPayments =
      successfulPayments.map((payment) => ({
        tenantName:
          payment.lease?.tenant?.fullName ||
          'Verified Tenant',

        propertyName:
          payment.lease?.property?.titleEn ||
          'Lease Property',

        txRef:
          payment.gatewayTransactionId ||
          `TX-${payment.id
            .substring(0, 8)
            .toUpperCase()}`,

        amount: Number(payment.amount || 0),

        commissionAmount: Number(
          payment.commissionAmount || 0
        ),

        status: payment.status,

        method: payment.method,

        createdAt: payment.createdAt,

        paidAt: payment.paidAt,
      }));

    // ========================================================
    // PROPERTY STATISTICS
    // ========================================================
    const [
      availableProps,
      rentedProps,
      approvedProps,
      rejectedProps,
      pendingProps,
      totalRequests,
    ] = await Promise.all([
      prisma.property.count({
        where: {
          status: 'APPROVED',
        },
      }),

      prisma.property.count({
        where: {
          status: 'RENTED',
        },
      }),

      prisma.property.count({
        where: {
          status: 'APPROVED',
        },
      }),

      prisma.property.count({
        where: {
          status: 'REJECTED',
        },
      }),

      prisma.property.count({
        where: {
          status: 'PENDING',
        },
      }),

      prisma.rentalRequest.count(),
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
      },
    });
  } catch (error) {
    console.error(
      'GET PAYMENTS SUMMARY ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        'Something went wrong fetching payments summary',
    });
  }
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  toggleUserActive,
  updateUserRole,
  getPaymentsSummary,
};
