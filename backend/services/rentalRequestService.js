const prisma = require("../prisma/client");

function maskFaydaNumber(value) {
  if (!value) return null;
  const clean = String(value).replace(/\s/g, "");
  if (clean.length <= 4) return "****";
  if (clean.length <= 8) return `${clean.slice(0, 4)} ****`;
  return `${clean.slice(0, 4)} **** ${clean.slice(-4)}`;
}

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

const landlordSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
};

// ======================================================
// CREATE RENTAL REQUEST (WITH EXPIRED LEASE OVERRIDE)
// ======================================================

async function createRentalRequest({
  tenantId,
  propertyId,
  message,
  proposedPrice,
  startDate,
  endDate,
}) {
  if (!tenantId || !propertyId) {
    throw new Error("tenantId and propertyId are required");
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("PROPERTY_NOT_FOUND");
  }

  if (property.status !== "APPROVED" && property.status !== "AVAILABLE") {
    throw new Error("PROPERTY_NOT_AVAILABLE");
  }

  const activeLease = await prisma.lease.findFirst({
    where: {
      propertyId,
      tenantId,
      status: "ACTIVE",
    },
  });

  if (activeLease) {
    throw new Error("ALREADY_RENTING");
  }

  let price = null;
  if (proposedPrice !== undefined && proposedPrice !== null && proposedPrice !== "") {
    price = Number(proposedPrice);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("INVALID_PROPOSED_PRICE");
    }
  }

  let parsedStartDate = startDate && startDate !== "" ? new Date(startDate) : null;
  let parsedEndDate = endDate && endDate !== "" ? new Date(endDate) : null;

  if (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) throw new Error("INVALID_START_DATE");
  if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) throw new Error("INVALID_END_DATE");
  if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
    throw new Error("END_DATE_BEFORE_START_DATE");
  }

  const existingRequest = await prisma.rentalRequest.findUnique({
    where: {
      tenantId_propertyId: {
        tenantId,
        propertyId,
      },
    },
  });

  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      throw new Error("RENTAL_REQUEST_ALREADY_EXISTS");
    }

    try {
      const renewedRequest = await prisma.rentalRequest.update({
        where: { id: existingRequest.id },
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
          tenant: { select: tenantSelect },
          landlord: { select: landlordSelect },
        },
      });

      if (renewedRequest.tenant) {
        renewedRequest.tenant.faydaNumber = maskFaydaNumber(renewedRequest.tenant.faydaNumber);
      }

      return renewedRequest;
    } catch (error) {
      console.error("REUSE RENTAL REQUEST ERROR:", error);
      throw error;
    }
  }

  let request;
  try {
    request = await prisma.rentalRequest.create({
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
        tenant: { select: tenantSelect },
        landlord: { select: landlordSelect },
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("RENTAL_REQUEST_ALREADY_EXISTS");
    }
    throw error;
  }

  if (request.tenant) {
    request.tenant.faydaNumber = maskFaydaNumber(request.tenant.faydaNumber);
  }

  return request;
}

// ======================================================
// GET RENTAL REQUESTS
// ======================================================

async function getRentalRequestsForUser(userId, role) {
  let where;
  if (role === "LANDLORD") {
    where = { landlordId: userId };
  } else if (role === "TENANT") {
    where = { tenantId: userId };
  } else if (role === "ADMIN") {
    where = {};
  } else {
    throw new Error("FORBIDDEN");
  }

  const requests = await prisma.rentalRequest.findMany({
    where,
    include: {
      property: true,
      tenant: { select: tenantSelect },
      landlord: { select: landlordSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  const enhancedRequests = await Promise.all(
    requests.map(async (request) => {
      const paymentRecord = await prisma.payment.findFirst({
        where: {
          status: "SUCCESS",
          OR: [
            { leaseId: request.id },
            { lease: { propertyId: request.propertyId, tenantId: request.tenantId } }
          ]
        },
      }).catch(() => null);

      const isPaid = Boolean(paymentRecord);

      return {
        ...request,
        isPaid,
        tenant: request.tenant
          ? {
              ...request.tenant,
              faydaNumber: maskFaydaNumber(request.tenant.faydaNumber),
            }
          : null,
      };
    })
  );

  return enhancedRequests;
}

// ======================================================
// UPDATE RENTAL REQUEST STATUS (NOW CREATES THE LEASE)
// ======================================================

async function updateRentalRequestStatus(id, userId, role, status) {
  const request = await prisma.rentalRequest.findUnique({ where: { id } });
  if (!request) {
    throw new Error("RENTAL_REQUEST_NOT_FOUND");
  }

  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  if (role === "LANDLORD") {
    if (request.landlordId !== userId) throw new Error("FORBIDDEN");
    if (status === "CANCELLED") throw new Error("FORBIDDEN");
  } else if (role === "TENANT") {
    if (request.tenantId !== userId) throw new Error("FORBIDDEN");
    if (status === "APPROVED" || status === "REJECTED") throw new Error("FORBIDDEN");
  } else if (role === "ADMIN") {
    // Admin allowed
  } else {
    throw new Error("FORBIDDEN");
  }

  if (request.status !== "PENDING") {
    throw new Error("REQUEST_ALREADY_PROCESSED");
  }

  // ----------------------------------------------------
  // APPROVAL: validate + create the Lease in one transaction
  // ----------------------------------------------------
  if (status === "APPROVED") {
    if (!request.startDate) throw new Error("START_DATE_REQUIRED");
    if (!request.endDate) throw new Error("END_DATE_REQUIRED");
    if (new Date(request.endDate) < new Date(request.startDate)) {
      throw new Error("END_DATE_BEFORE_START_DATE");
    }

    const property = await prisma.property.findUnique({
      where: { id: request.propertyId },
    });

    if (!property) throw new Error("PROPERTY_NOT_FOUND");

    if (property.status !== "APPROVED" && property.status !== "AVAILABLE") {
      throw new Error("PROPERTY_NOT_AVAILABLE");
    }

    const activeLease = await prisma.lease.findFirst({
      where: {
        propertyId: request.propertyId,
        tenantId: request.tenantId,
        status: "ACTIVE",
      },
    });

    if (activeLease) throw new Error("ALREADY_RENTING");

    const rentAmount = request.proposedPrice ?? property.price;

    if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
      throw new Error("INVALID_RENT_AMOUNT");
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.rentalRequest.update({
        where: { id },
        data: { status },
        include: {
          property: true,
          tenant: { select: tenantSelect },
          landlord: { select: landlordSelect },
        },
      }),
      prisma.lease.create({
        data: {
          propertyId: request.propertyId,
          tenantId: request.tenantId,
          startDate: request.startDate,
          endDate: request.endDate,
          rentAmount,
          status: "ACTIVE",
        },
      }),
      prisma.property.update({
        where: { id: request.propertyId },
        data: { status: "RENTED" },
      }),
    ]);

    if (updatedRequest.tenant) {
      updatedRequest.tenant.faydaNumber = maskFaydaNumber(updatedRequest.tenant.faydaNumber);
    }

    return updatedRequest;
  }

  // ----------------------------------------------------
  // REJECTED / CANCELLED — no lease involved
  // ----------------------------------------------------
  const updatedRequest = await prisma.rentalRequest.update({
    where: { id },
    data: { status },
    include: {
      property: true,
      tenant: { select: tenantSelect },
      landlord: { select: landlordSelect },
    },
  });

  if (updatedRequest.tenant) {
    updatedRequest.tenant.faydaNumber = maskFaydaNumber(updatedRequest.tenant.faydaNumber);
  }

  return updatedRequest;
}

module.exports = {
  createRentalRequest,
  getRentalRequestsForUser,
  updateRentalRequestStatus,
};