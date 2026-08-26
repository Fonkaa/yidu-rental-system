const prisma = require("../prisma/client");
const {
  createRentalRequest,
  getRentalRequestsForUser,
  updateRentalRequestStatus,
} = require("../services/rentalRequestService");
const { notifyUser } = require("../services/notificationService");

// ======================================================
// CREATE RENTAL REQUEST
// ======================================================

async function createRequest(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: "propertyId is required",
      });
    }

    const request = await createRentalRequest({
      tenantId: req.user.userId,
      ...req.body,
    });

    // --- NOTIFY LANDLORD ---
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { landlordId: true, titleEn: true }
      });
      const tenantUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { fullName: true }
      });

      if (property) {
        await notifyUser(
          property.landlordId,
          'RENTAL_REQUEST',
          'New Rental Inquiry! 🏠',
          `${tenantUser?.fullName || 'A tenant'} submitted a rental request for "${property.titleEn || 'your property'}".`,
          'Property',
          propertyId
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify landlord:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Rental request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("CREATE RENTAL REQUEST ERROR:", error);

    // Already exists
    if (error.message === "RENTAL_REQUEST_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        error: "RENTAL_REQUEST_ALREADY_EXISTS",
        message:
          "You have already submitted a rental request for this property.",
      });
    }

    // Property doesn't exist
    if (error.message === "PROPERTY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "PROPERTY_NOT_FOUND",
        message: "Property not found.",
      });
    }

    // Property unavailable
    if (error.message === "PROPERTY_NOT_AVAILABLE") {
      return res.status(400).json({
        success: false,
        error: "PROPERTY_NOT_AVAILABLE",
        message:
          "This property is currently not available for rental.",
      });
    }

    // Tenant already renting another property
    if (error.message === "ALREADY_RENTING") {
      return res.status(400).json({
        success: false,
        error: "ALREADY_RENTING",
        message:
          "You already have an active rental.",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "RENTAL_REQUEST_CREATE_FAILED",
      message:
        "Something went wrong while creating the rental request.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}

// ======================================================
// LIST RENTAL REQUESTS
// ======================================================

async function listRequests(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const requests = await getRentalRequestsForUser(
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "GET RENTAL REQUESTS ERROR:",
      error
    );

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message:
          "You are not allowed to access these requests.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "RENTAL_REQUEST_FETCH_FAILED",
      message:
        "Something went wrong while fetching rental requests.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}

// ======================================================
// UPDATE RENTAL REQUEST STATUS
// ======================================================

async function updateRequestStatus(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Rental request id is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "status is required",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_STATUS",
        message:
          "Invalid rental request status.",
        allowedStatuses,
      });
    }

    const request = await updateRentalRequestStatus(
      id,
      req.user.userId,
      req.user.role,
      status
    );

    // --- NOTIFY TENANT OF STATUS CHANGE ---
    try {
      const fullReq = await prisma.rentalRequest.findUnique({
        where: { id },
        include: { property: { select: { titleEn: true } } }
      });

      if (fullReq && fullReq.tenantId) {
        const isApproved = status === 'APPROVED';
        await notifyUser(
          fullReq.tenantId,
          isApproved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
          isApproved ? 'Rental Request Approved! 🎉' : 'Rental Request Update',
          isApproved 
            ? `Your request for "${fullReq.property?.titleEn || 'property'}" has been approved by the landlord.` 
            : `Your rental request was declined.`,
          'RentalRequest',
          id
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify tenant:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message:
        "Rental request status updated successfully",
      request,
    });
  } catch (error) {
    console.error(
      "UPDATE RENTAL REQUEST ERROR:",
      error
    );

    if (
      error.message ===
      "RENTAL_REQUEST_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error: "RENTAL_REQUEST_NOT_FOUND",
        message: "Rental request not found.",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message:
          "You are not allowed to update this request.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "RENTAL_REQUEST_UPDATE_FAILED",
      message:
        "Something went wrong while updating request status.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createRequest,
  listRequests,
  updateRequestStatus,
};