const prisma = require("../prisma/client");

// ==========================================
// MASK FAYDA NUMBER
// ==========================================
function maskFaydaNumber(value) {
  if (!value) return null;

  const clean = String(value).replace(/\s/g, "");

  if (clean.length <= 4) return "****";
  if (clean.length <= 8) return `${clean.slice(0, 4)} ****`;

  return `${clean.slice(0, 4)} **** ${clean.slice(-4)}`;
}

// ==========================================
// TENANT SELECT
// ==========================================
const tenantSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  faydaNumber: true,
  gender: true,
  maritalStatus: true,
  familyNumber: true,
};

// ==========================================
// LANDLORD SELECT
// ==========================================
const landlordSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
};

// ==========================================
// ATTACH LEASE + PAYMENT
// ==========================================
async function attachLeaseAndPayment(request) {
  if (!request) return request;

  const lease = await prisma.lease.findFirst({
    where: {
      tenantId: request.tenantId,
      propertyId: request.propertyId,
    },
    include: {
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const payment = lease?.payment || null;

  return {
    ...request,

    // IMPORTANT:
    // This is the REAL Lease ID.
    leaseId: lease?.id || null,

    lease: lease || null,

    payment,

    isPaid: payment?.status === "SUCCESS",

    tenant: request.tenant
      ? {
          ...request.tenant,
          faydaNumber: maskFaydaNumber(
            request.tenant.faydaNumber
          ),
        }
      : null,
  };
}

// ==========================================
// CREATE RENTAL REQUEST
// ==========================================
async function createRentalRequest({
  tenantId,
  propertyId,
  message,
  proposedPrice,
  startDate,
  endDate,
}) {
  if (!tenantId || !propertyId) {
    throw new Error(
      "tenantId and propertyId are required"
    );
  }

  // ========================================
  // FIND PROPERTY
  // ========================================
  const property =
    await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });

  if (!property) {
    throw new Error("PROPERTY_NOT_FOUND");
  }

  // ========================================
  // CHECK PROPERTY AVAILABILITY
  // ========================================
  if (
    property.status !== "APPROVED" &&
    property.status !== "AVAILABLE"
  ) {
    throw new Error("PROPERTY_NOT_AVAILABLE");
  }

  // ========================================
  // CHECK ACTIVE LEASE
  // ========================================
  const activeLease =
    await prisma.lease.findFirst({
      where: {
        propertyId,
        tenantId,
        status: "ACTIVE",
      },
    });

  if (activeLease) {
    throw new Error("ALREADY_RENTING");
  }

  // ========================================
  // VALIDATE PRICE
  // ========================================
  let price = null;

  if (
    proposedPrice !== undefined &&
    proposedPrice !== null &&
    proposedPrice !== ""
  ) {
    price = Number(proposedPrice);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        "INVALID_PROPOSED_PRICE"
      );
    }
  }

  // ========================================
  // VALIDATE START DATE
  // ========================================
  let parsedStartDate =
    startDate && startDate !== ""
      ? new Date(startDate)
      : null;

  if (
    parsedStartDate &&
    Number.isNaN(parsedStartDate.getTime())
  ) {
    throw new Error("INVALID_START_DATE");
  }

  // ========================================
  // VALIDATE END DATE
  // ========================================
  let parsedEndDate =
    endDate && endDate !== ""
      ? new Date(endDate)
      : null;

  if (
    parsedEndDate &&
    Number.isNaN(parsedEndDate.getTime())
  ) {
    throw new Error("INVALID_END_DATE");
  }

  // ========================================
  // CHECK DATE ORDER
  // ========================================
  if (
    parsedStartDate &&
    parsedEndDate &&
    parsedEndDate < parsedStartDate
  ) {
    throw new Error(
      "END_DATE_BEFORE_START_DATE"
    );
  }

  // ========================================
  // FIND EXISTING REQUEST
  // ========================================
  const existingRequest =
    await prisma.rentalRequest.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId,
          propertyId,
        },
      },
    });

  // ========================================
  // REUSE OLD REQUEST
  // ========================================
  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      throw new Error(
        "RENTAL_REQUEST_ALREADY_EXISTS"
      );
    }

    const renewedRequest =
      await prisma.rentalRequest.update({
        where: {
          id: existingRequest.id,
        },

        data: {
          status: "PENDING",
          message: message?.trim() || "",
          proposedPrice: price,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          landlordId: property.landlordId,
        },

        include: {
          property: true,

          tenant: {
            select: tenantSelect,
          },

          landlord: {
            select: landlordSelect,
          },
        },
      });

    if (renewedRequest.tenant) {
      renewedRequest.tenant.faydaNumber =
        maskFaydaNumber(
          renewedRequest.tenant.faydaNumber
        );
    }

    return renewedRequest;
  }

  // ========================================
  // CREATE NEW REQUEST
  // ========================================
  try {
    const request =
      await prisma.rentalRequest.create({
        data: {
          tenantId,
          propertyId,
          landlordId: property.landlordId,
          message: message?.trim() || "",
          proposedPrice: price,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          status: "PENDING",
        },

        include: {
          property: true,

          tenant: {
            select: tenantSelect,
          },

          landlord: {
            select: landlordSelect,
          },
        },
      });

    if (request.tenant) {
      request.tenant.faydaNumber =
        maskFaydaNumber(
          request.tenant.faydaNumber
        );
    }

    return request;
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error(
        "RENTAL_REQUEST_ALREADY_EXISTS"
      );
    }

    throw error;
  }
}

// ==========================================
// GET RENTAL REQUESTS
// ==========================================
async function getRentalRequestsForUser(
  userId,
  role
) {
  let where;

  if (role === "LANDLORD") {
    where = {
      landlordId: userId,
    };
  } else if (role === "TENANT") {
    where = {
      tenantId: userId,
    };
  } else if (role === "ADMIN") {
    where = {};
  } else {
    throw new Error("FORBIDDEN");
  }

  const requests =
    await prisma.rentalRequest.findMany({
      where,

      include: {
        property: true,

        tenant: {
          select: tenantSelect,
        },

        landlord: {
          select: landlordSelect,
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const enhancedRequests =
    await Promise.all(
      requests.map((request) =>
        attachLeaseAndPayment(request)
      )
    );

  return enhancedRequests;
}

// ==========================================
// UPDATE RENTAL REQUEST STATUS
// ==========================================
async function updateRentalRequestStatus(
  id,
  userId,
  role,
  status
) {
  // ========================================
  // FIND REQUEST
  // ========================================
  const request =
    await prisma.rentalRequest.findUnique({
      where: {
        id,
      },
    });

  if (!request) {
    throw new Error(
      "RENTAL_REQUEST_NOT_FOUND"
    );
  }

  // ========================================
  // VALID STATUSES
  // ========================================
  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  // ========================================
  // PREVENT DOUBLE APPROVAL
  // ========================================
  if (
    status === "APPROVED" &&
    request.status !== "PENDING"
  ) {
    throw new Error(
      "REQUEST_ALREADY_PROCESSED"
    );
  }

  // ========================================
  // AUTHORIZATION
  // ========================================
  if (role === "LANDLORD") {
    if (request.landlordId !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (status === "CANCELLED") {
      throw new Error("FORBIDDEN");
    }
  } else if (role === "TENANT") {
    if (request.tenantId !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (
      status === "APPROVED" ||
      status === "REJECTED"
    ) {
      throw new Error("FORBIDDEN");
    }
  } else if (role === "ADMIN") {
    // Admin allowed
  } else {
    throw new Error("FORBIDDEN");
  }

  // ==========================================
  // APPROVE REQUEST
  // ==========================================
  if (status === "APPROVED") {
    // ----------------------------------------
    // START DATE REQUIRED
    // ----------------------------------------
    if (!request.startDate) {
      throw new Error(
        "START_DATE_REQUIRED"
      );
    }

    // ----------------------------------------
    // END DATE REQUIRED
    // ----------------------------------------
    if (!request.endDate) {
      throw new Error(
        "END_DATE_REQUIRED"
      );
    }

    // ----------------------------------------
    // DATE VALIDATION
    // ----------------------------------------
    if (
      request.endDate <
      request.startDate
    ) {
      throw new Error(
        "END_DATE_BEFORE_START_DATE"
      );
    }

    // ----------------------------------------
    // GET PROPERTY
    // ----------------------------------------
    const property =
      await prisma.property.findUnique({
        where: {
          id: request.propertyId,
        },
      });

    if (!property) {
      throw new Error(
        "PROPERTY_NOT_FOUND"
      );
    }

    // ----------------------------------------
    // PROPERTY MUST STILL BE AVAILABLE
    // ----------------------------------------
    if (
      property.status !== "APPROVED" &&
      property.status !== "AVAILABLE"
    ) {
      throw new Error(
        "PROPERTY_NOT_AVAILABLE"
      );
    }

    // ----------------------------------------
    // CHECK ACTIVE LEASE
    // ----------------------------------------
    const existingLease =
      await prisma.lease.findFirst({
        where: {
          tenantId: request.tenantId,
          propertyId: request.propertyId,
          status: "ACTIVE",
        },
      });

    if (existingLease) {
      throw new Error(
        "ALREADY_RENTING"
      );
    }

    // ----------------------------------------
    // RENT AMOUNT
    // ----------------------------------------
    const rentAmount =
      request.proposedPrice !== null &&
      request.proposedPrice !== undefined
        ? Number(request.proposedPrice)
        : Number(property.price);

    if (
      !Number.isFinite(rentAmount) ||
      rentAmount < 0
    ) {
      throw new Error(
        "INVALID_RENT_AMOUNT"
      );
    }

    // ========================================
    // TRANSACTION
    // ========================================
    const result =
      await prisma.$transaction(
        async (tx) => {
          // ----------------------------------
          // UPDATE REQUEST
          // ----------------------------------
          const updatedRequest =
            await tx.rentalRequest.update({
              where: {
                id,
              },

              data: {
                status: "APPROVED",
              },

              include: {
                property: true,

                tenant: {
                  select: tenantSelect,
                },

                landlord: {
                  select: landlordSelect,
                },
              },
            });

          // ----------------------------------
          // CREATE REAL LEASE
          // ----------------------------------
          const lease =
            await tx.lease.create({
              data: {
                tenantId:
                  request.tenantId,

                propertyId:
                  request.propertyId,

                startDate:
                  request.startDate,

                endDate:
                  request.endDate,

                rentAmount,

                status: "ACTIVE",
              },

              include: {
                payment: true,
              },
            });

          /*
           * IMPORTANT
           *
           * DO NOT set property to RENTED here.
           *
           * Tenant must pay first.
           *
           * Chapa SUCCESS will change
           * the property to RENTED.
           */

          return {
            updatedRequest,
            lease,
          };
        }
      );

    // ========================================
    // RESPONSE WITH REAL LEASE ID
    // ========================================
    return {
      ...result.updatedRequest,

      leaseId: result.lease.id,

      lease: result.lease,

      payment:
        result.lease.payment || null,

      isPaid:
        result.lease.payment?.status ===
        "SUCCESS",

      tenant:
        result.updatedRequest.tenant
          ? {
              ...result.updatedRequest.tenant,

              faydaNumber:
                maskFaydaNumber(
                  result.updatedRequest
                    .tenant.faydaNumber
                ),
            }
          : null,
    };
  }

  // ==========================================
  // REJECT / CANCEL / OTHER STATUS
  // ==========================================
  const updatedRequest =
    await prisma.rentalRequest.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include: {
        property: true,

        tenant: {
          select: tenantSelect,
        },

        landlord: {
          select: landlordSelect,
        },
      },
    });

  return attachLeaseAndPayment(
    updatedRequest
  );
}

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  createRentalRequest,
  getRentalRequestsForUser,
  updateRentalRequestStatus,
};