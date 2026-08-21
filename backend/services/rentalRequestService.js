const prisma = require("../prisma/client");

// ======================================================
// MASK FAYDA NUMBER
// ======================================================

function maskFaydaNumber(value) {
  if (!value) {
    return null;
  }

  const clean = String(value).replace(/\s/g, "");

  if (clean.length <= 4) {
    return "****";
  }

  if (clean.length <= 8) {
    return `${clean.slice(0, 4)} ****`;
  }

  return `${clean.slice(0, 4)} **** ${clean.slice(-4)}`;
}

// ======================================================
// TENANT INFORMATION
// ======================================================

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

// ======================================================
// LANDLORD INFORMATION
// ======================================================

const landlordSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
};

// ======================================================
// CREATE RENTAL REQUEST
// ======================================================

async function createRentalRequest({
  tenantId,
  propertyId,
  message,
  proposedPrice,
  startDate,
  endDate,
}) {
  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  if (!tenantId || !propertyId) {
    throw new Error("tenantId and propertyId are required");
  }

  // --------------------------------------------------
  // CHECK PROPERTY
  // --------------------------------------------------

  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new Error("PROPERTY_NOT_FOUND");
  }

  // --------------------------------------------------
  // PROPERTY MUST BE APPROVED
  // --------------------------------------------------

  if (property.status !== "APPROVED") {
    throw new Error("PROPERTY_NOT_AVAILABLE");
  }

  // --------------------------------------------------
  // CHECK EXISTING REQUEST
  // --------------------------------------------------

  const existingRequest =
    await prisma.rentalRequest.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId,
          propertyId,
        },
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

  // --------------------------------------------------
  // PREPARE PRICE
  // --------------------------------------------------

  let price = null;

  if (
    proposedPrice !== undefined &&
    proposedPrice !== null &&
    proposedPrice !== ""
  ) {
    price = Number(proposedPrice);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("INVALID_PROPOSED_PRICE");
    }
  }

  // --------------------------------------------------
  // PREPARE DATES
  // --------------------------------------------------

  let parsedStartDate = null;
  let parsedEndDate = null;

  if (startDate && startDate !== "") {
    parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      throw new Error("INVALID_START_DATE");
    }
  }

  if (endDate && endDate !== "") {
    parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedEndDate.getTime())) {
      throw new Error("INVALID_END_DATE");
    }
  }

  // --------------------------------------------------
  // VALIDATE DATE ORDER
  // --------------------------------------------------

  if (
    parsedStartDate &&
    parsedEndDate &&
    parsedEndDate < parsedStartDate
  ) {
    throw new Error("END_DATE_BEFORE_START_DATE");
  }

  // ==================================================
  // EXISTING REQUEST HANDLING
  // ==================================================

  if (existingRequest) {
    /*
      Because the database has:

      @@unique([tenantId, propertyId])

      only ONE rental request can exist for the
      same tenant + property.

      Therefore:

      PENDING   -> cannot submit again
      APPROVED  -> cannot submit again
      REJECTED  -> can submit again
      CANCELLED -> can submit again
    */

    if (
      existingRequest.status === "PENDING" ||
      existingRequest.status === "APPROVED"
    ) {
      throw new Error("RENTAL_REQUEST_ALREADY_EXISTS");
    }

    // ------------------------------------------------
    // REUSE REJECTED / CANCELLED REQUEST
    // ------------------------------------------------

    if (
      existingRequest.status === "REJECTED" ||
      existingRequest.status === "CANCELLED"
    ) {
      try {
        const renewedRequest =
          await prisma.rentalRequest.update({
            where: {
              id: existingRequest.id,
            },

            data: {
              status: "PENDING",

              message:
                message?.trim() || "",

              proposedPrice: price,

              startDate: parsedStartDate,

              endDate: parsedEndDate,

              landlordId:
                property.landlordId,
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

        // --------------------------------------------
        // MASK FAYDA
        // --------------------------------------------

        if (renewedRequest.tenant) {
          renewedRequest.tenant.faydaNumber =
            maskFaydaNumber(
              renewedRequest.tenant.faydaNumber
            );
        }

        return renewedRequest;
      } catch (error) {
        console.error(
          "REUSE RENTAL REQUEST ERROR:",
          error
        );

        throw error;
      }
    }

    // ------------------------------------------------
    // UNKNOWN STATUS
    // ------------------------------------------------

    throw new Error("RENTAL_REQUEST_ALREADY_EXISTS");
  }

  // ==================================================
  // CREATE NEW REQUEST
  // ==================================================

  let request;

  try {
    request =
      await prisma.rentalRequest.create({
        data: {
          tenantId,

          propertyId,

          landlordId:
            property.landlordId,

          message:
            message?.trim() || "",

          proposedPrice: price,

          startDate: parsedStartDate,

          endDate: parsedEndDate,
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
  } catch (error) {
    // ------------------------------------------------
    // HANDLE DUPLICATE REQUEST
    // ------------------------------------------------

    if (error.code === "P2002") {
      throw new Error(
        "RENTAL_REQUEST_ALREADY_EXISTS"
      );
    }

    throw error;
  }

  // ==================================================
  // MASK FAYDA
  // ==================================================

  if (request.tenant) {
    request.tenant.faydaNumber =
      maskFaydaNumber(
        request.tenant.faydaNumber
      );
  }

  return request;
}

// ======================================================
// GET RENTAL REQUESTS
// ======================================================

async function getRentalRequestsForUser(
  userId,
  role
) {
  let where;

  // --------------------------------------------------
  // LANDLORD
  // --------------------------------------------------

  if (role === "LANDLORD") {
    where = {
      landlordId: userId,
    };
  }

  // --------------------------------------------------
  // TENANT
  // --------------------------------------------------

  else if (role === "TENANT") {
    where = {
      tenantId: userId,
    };
  }

  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  else if (role === "ADMIN") {
    where = {};
  }

  // --------------------------------------------------
  // INVALID ROLE
  // --------------------------------------------------

  else {
    throw new Error("FORBIDDEN");
  }

  // ==================================================
  // GET REQUESTS
  // ==================================================

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

  // ==================================================
  // MASK FAYDA
  // ==================================================

  return requests.map((request) => ({
    ...request,

    tenant: request.tenant
      ? {
          ...request.tenant,

          faydaNumber:
            maskFaydaNumber(
              request.tenant.faydaNumber
            ),
        }
      : null,
  }));
}

// ======================================================
// UPDATE RENTAL REQUEST STATUS
// ======================================================

async function updateRentalRequestStatus(
  id,
  userId,
  role,
  status
) {
  // --------------------------------------------------
  // FIND REQUEST
  // --------------------------------------------------

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

  // --------------------------------------------------
  // VALIDATE STATUS
  // --------------------------------------------------

  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  // --------------------------------------------------
  // LANDLORD
  // --------------------------------------------------

  if (role === "LANDLORD") {
    if (request.landlordId !== userId) {
      throw new Error("FORBIDDEN");
    }

    /*
      Landlord should normally approve/reject,
      but should not cancel tenant requests.
    */

    if (
      status === "CANCELLED"
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  // --------------------------------------------------
  // TENANT
  // --------------------------------------------------

  else if (role === "TENANT") {
    if (request.tenantId !== userId) {
      throw new Error("FORBIDDEN");
    }

    /*
      Tenant should normally cancel their own
      request, not approve/reject it.
    */

    if (
      status === "APPROVED" ||
      status === "REJECTED"
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  else if (role === "ADMIN") {
    // Admin allowed
  }

  // --------------------------------------------------
  // INVALID ROLE
  // --------------------------------------------------

  else {
    throw new Error("FORBIDDEN");
  }

  // ==================================================
  // UPDATE
  // ==================================================

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

  // ==================================================
  // MASK FAYDA
  // ==================================================

  if (updatedRequest.tenant) {
    updatedRequest.tenant.faydaNumber =
      maskFaydaNumber(
        updatedRequest.tenant.faydaNumber
      );
  }

  return updatedRequest;
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createRentalRequest,
  getRentalRequestsForUser,
  updateRentalRequestStatus,
};