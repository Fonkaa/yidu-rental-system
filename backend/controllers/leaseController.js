const prisma = require("../prisma/client");

// ==========================================
// GET ALL LEASES FOR LOGGED-IN TENANT
// ==========================================
async function getTenantLeases(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const tenantId = req.user.userId;

    // 1. Auto-release expired active leases (Only expire if endDate date is strictly past today)
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Give until end of the expiry day

    const expiredLeases = await prisma.lease.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: now }
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

    // 2. Fetch all leases belonging to this tenant with correct relations
    const rawLeases = await prisma.lease.findMany({
      where: { tenantId },
      include: {
        property: {
          include: {
            location: true,
            images: true,
          }
        },
        tenant: { select: { id: true, fullName: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. STRICT LEASE-ID DEDUPLICATION
    const uniqueLeaseMap = new Map();
    rawLeases.forEach((lease) => {
      if (!uniqueLeaseMap.has(lease.id)) {
        uniqueLeaseMap.set(lease.id, lease);
      }
    });

    const leases = Array.from(uniqueLeaseMap.values());

    return res.status(200).json({
      success: true,
      leases,
    });

  } catch (error) {
    console.error("GET TENANT LEASES ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to load tenant leases." });
  }
}

module.exports = {
  getTenantLeases,
};