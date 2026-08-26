const prisma = require("../prisma/client");

// ======================================================
// GET UNIFIED DASHBOARD STATS & DATA (Tenant & Landlord)
// ======================================================

const getDashboardData = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const userId = req.user.userId;
    const userRole = req.user.role ? req.user.role.toUpperCase() : "TENANT";

    // --------------------------------------------------
    // LANDLORD DASHBOARD DATA
    // --------------------------------------------------
    if (userRole === "LANDLORD") {
      const properties = await prisma.property.findMany({
        where: { landlordId: userId },
        include: {
          category: true,
          location: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const rentalRequests = await prisma.rentalRequest.findMany({
        where: {
          property: {
            landlordId: userId,
          },
        },
        include: {
          property: { select: { titleEn: true, titleAm: true, price: true } },
          tenant: { select: { fullName: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []);

      const totalProperties = properties.length;
      const totalPortfolioValue = properties.reduce((acc, p) => acc + Number(p.price || 0), 0);
      
      const rentedProperties = properties.filter(p => p.status === 'RENTED');
      const totalRentedEarnings = rentedProperties.reduce((acc, p) => acc + Number(p.price || 0), 0);
      const pendingRequestsCount = rentalRequests.filter(r => r.status === 'PENDING').length;

      return res.status(200).json({
        success: true,
        role: "LANDLORD",
        analytics: {
          totalProperties,
          totalPortfolioValue,
          totalRentedEarnings,
          pendingRequestsCount,
        },
        properties,
        rentalRequests,
      });
    }

    // --------------------------------------------------
    // AUTO-RELEASE EXPIRED LEASES FOR TENANTS/SYSTEM
    // --------------------------------------------------
    const now = new Date();
    const expiredLeases = await prisma.lease.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now }
      }
    }).catch(() => []);

    if (expiredLeases.length > 0) {
      const propertyIdsToRelease = expiredLeases.map(l => l.propertyId);
      
      await prisma.lease.updateMany({
        where: { id: { in: expiredLeases.map(l => l.id) } },
        data: { status: 'EXPIRED' }
      });

      await prisma.property.updateMany({
        where: { id: { in: propertyIdsToRelease } },
        data: { status: 'APPROVED' }
      });
    }

    // --------------------------------------------------
    // TENANT DASHBOARD DATA (Default - Filters out Rented homes older than 3 days)
    // --------------------------------------------------
    const rawProperties = await prisma.property.findMany({
      include: {
        category: true,
        location: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove duplicate records safely using a unique Map by ID
    const uniqueMap = new Map();
    rawProperties.forEach(p => uniqueMap.set(p.id, p));
    const allUniqueProperties = Array.from(uniqueMap.values());

    // Calculate 3 days ago threshold
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Filter properties: Keep available ones AND rented ones that became rented within the last 3 days
    const properties = allUniqueProperties.filter((p) => {
      const status = String(p.status || "").trim().toUpperCase();
      const isAvailable = status === "APPROVED" || status === "AVAILABLE";
      const isRented = status === "RENTED" || status === "OCCUPIED" || status === "LEASED" || status === "UNAVAILABLE";

      if (isAvailable) return true;

      if (isRented) {
        // Check when it was updated/rented (fallback to createdAt if updatedAt isn't available)
        const rentedTimestamp = new Date(p.updatedAt || p.createdAt);
        // Keep it in the feed only if it has been rented for LESS than 3 days
        return rentedTimestamp > threeDaysAgo;
      }

      return false; // Exclude unknown/rejected statuses from tenant view
    });

    const availableCount = properties.filter(
      (p) => String(p.status || "").trim().toUpperCase() === "APPROVED" || String(p.status || "").trim().toUpperCase() === "AVAILABLE"
    ).length;

    const savedCount = await prisma.favorite.count({
      where: {
        userId: userId,
      }
    }).catch(() => 0);

    const requestsCount = await prisma.rentalRequest.count({
      where: { tenantId: userId }
    }).catch(() => 0);

    const leasesCount = await prisma.lease.count({
      where: { tenantId: userId, status: "ACTIVE" }
    }).catch(() => 0);

    return res.status(200).json({
      success: true,
      role: "TENANT",
      stats: {
        available: availableCount,
        saved: savedCount,
        requests: requestsCount,
        leases: leasesCount,
      },
      properties,
    });

  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load dashboard data from database.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboardData,
};