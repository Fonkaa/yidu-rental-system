const prisma = require("../prisma/client");

// ==========================================
// GET ALL LEASES FOR LOGGED-IN TENANT
// ==========================================
async function getTenantLeases(req, res) {
  try {
    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        error:
          "Authentication required",
      });
    }

    const tenantId = req.user.userId;

    // ========================================
    // EXPIRE OLD ACTIVE LEASES
    // ========================================
    const now = new Date();

    // Lease remains active until the
    // end of its endDate.
    now.setHours(
      23,
      59,
      59,
      999
    );

    const expiredLeases =
      await prisma.lease.findMany({
        where: {
          status: "ACTIVE",

          endDate: {
            lt: now,
          },
        },

        select: {
          id: true,
          propertyId: true,
        },
      });

    // ========================================
    // EXPIRE LEASES
    // ========================================
    if (expiredLeases.length > 0) {
      await prisma.lease.updateMany({
        where: {
          id: {
            in: expiredLeases.map(
              (lease) => lease.id
            ),
          },
        },

        data: {
          status: "EXPIRED",
        },
      });

      // ======================================
      // RELEASE PROPERTY ONLY IF THERE IS
      // NO OTHER ACTIVE LEASE
      // ======================================
      for (const lease of expiredLeases) {
        const anotherActiveLease =
          await prisma.lease.findFirst({
            where: {
              propertyId:
                lease.propertyId,

              status: "ACTIVE",
            },
          });

        if (!anotherActiveLease) {
          await prisma.property.update({
            where: {
              id: lease.propertyId,
            },

            data: {
              status: "APPROVED",
            },
          });
        }
      }
    }

    // ========================================
    // GET TENANT LEASES
    // ========================================
    const rawLeases =
      await prisma.lease.findMany({
        where: {
          tenantId,
        },

        include: {
          property: {
            include: {
              location: true,
              images: true,
            },
          },

          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },

          payment: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ========================================
    // DEDUPLICATE BY REAL LEASE ID
    // ========================================
    const uniqueLeaseMap =
      new Map();

    rawLeases.forEach((lease) => {
      if (
        !uniqueLeaseMap.has(
          lease.id
        )
      ) {
        uniqueLeaseMap.set(
          lease.id,
          lease
        );
      }
    });

    const leases = Array.from(
      uniqueLeaseMap.values()
    );

    return res.status(200).json({
      success: true,
      count: leases.length,
      leases,
    });
  } catch (error) {
    console.error(
      "GET TENANT LEASES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Failed to load tenant leases.",

      details:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
}

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  getTenantLeases,
};