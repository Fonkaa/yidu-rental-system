const prisma = require("../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  createRentalRequest,
  getRentalRequestsForUser,
  updateRentalRequestStatus,
} = require("../services/rentalRequestService");

const {
  notifyUser,
} = require("../services/notificationService");

// ==========================================
// CREATE RENTAL REQUEST
// ==========================================
async function createRequest(req, res) {
  try {
    let tenantId = req.user?.userId;
    let token = null;

    const {
      propertyId,
      fullName,
      email,
      phone,
      password,
    } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: "propertyId is required",
      });
    }

    // ========================================
    // GUEST REGISTRATION
    // ========================================
    if (!tenantId) {
      if (
        !email ||
        !password ||
        !fullName
      ) {
        return res.status(401).json({
          success: false,
          error:
            "Authentication required or provide full name, email and password to register and submit.",
        });
      }

      let user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (!user) {
        const passwordHash =
          await bcrypt.hash(
            password,
            10
          );

        user =
          await prisma.user.create({
            data: {
              fullName,
              email,
              phone: phone || "",
              passwordHash,
              role: "TENANT",
            },
          });
      } else {
        const isMatch =
          await bcrypt.compare(
            password,
            user.passwordHash
          );

        if (!isMatch) {
          return res.status(400).json({
            success: false,
            error:
              "An account with this email already exists with a different password.",
          });
        }
      }

      tenantId = user.id;

      token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
    }

    // ========================================
    // CREATE REQUEST
    // ========================================
    const request =
      await createRentalRequest({
        tenantId,
        propertyId,
        ...req.body,
      });

    // ========================================
    // NOTIFY LANDLORD
    // ========================================
    try {
      const property =
        await prisma.property.findUnique({
          where: {
            id: propertyId,
          },

          select: {
            landlordId: true,
            titleEn: true,
          },
        });

      const tenantUser =
        await prisma.user.findUnique({
          where: {
            id: tenantId,
          },

          select: {
            fullName: true,
          },
        });

      if (property) {
        await notifyUser(
          property.landlordId,
          "RENTAL_REQUEST",
          "New Rental Inquiry! 🏠",
          `${
            tenantUser?.fullName ||
            "A tenant"
          } submitted a rental request for "${
            property.titleEn ||
            "your property"
          }".`,
          "Property",
          propertyId
        );
      }
    } catch (notificationError) {
      console.error(
        "Failed to notify landlord:",
        notificationError
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Rental request submitted successfully",
      token,
      request,
    });
  } catch (error) {
    console.error(
      "CREATE RENTAL REQUEST ERROR:",
      error
    );

    if (
      error.message ===
      "RENTAL_REQUEST_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        error:
          "RENTAL_REQUEST_ALREADY_EXISTS",
        message:
          "You have already submitted a rental request for this property.",
      });
    }

    if (
      error.message ===
      "PROPERTY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error: "PROPERTY_NOT_FOUND",
        message: "Property not found.",
      });
    }

    if (
      error.message ===
      "PROPERTY_NOT_AVAILABLE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "PROPERTY_NOT_AVAILABLE",
        message:
          "This property is currently not available for rental.",
      });
    }

    if (
      error.message ===
      "ALREADY_RENTING"
    ) {
      return res.status(400).json({
        success: false,
        error: "ALREADY_RENTING",
        message:
          "You already have an active rental.",
      });
    }

    if (
      error.message ===
      "INVALID_PROPOSED_PRICE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "INVALID_PROPOSED_PRICE",
        message:
          "The proposed rent amount is invalid.",
      });
    }

    if (
      error.message ===
      "INVALID_START_DATE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "INVALID_START_DATE",
        message:
          "The start date is invalid.",
      });
    }

    if (
      error.message ===
      "INVALID_END_DATE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "INVALID_END_DATE",
        message:
          "The end date is invalid.",
      });
    }

    if (
      error.message ===
      "END_DATE_BEFORE_START_DATE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "END_DATE_BEFORE_START_DATE",
        message:
          "End date cannot be before start date.",
      });
    }

    return res.status(500).json({
      success: false,
      error:
        "RENTAL_REQUEST_CREATE_FAILED",
      message:
        "Something went wrong while creating the rental request.",
      details:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
}

// ==========================================
// GET RENTAL REQUESTS
// ==========================================
async function listRequests(req, res) {
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

    const requests =
      await getRentalRequestsForUser(
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
      error:
        "RENTAL_REQUEST_FETCH_FAILED",
      message:
        "Something went wrong while fetching rental requests.",
      details:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
}

// ==========================================
// UPDATE REQUEST STATUS
// ==========================================
async function updateRequestStatus(
  req,
  res
) {
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

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error:
          "Rental request id is required",
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

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        error: "INVALID_STATUS",
        message:
          "Invalid rental request status.",
        allowedStatuses,
      });
    }

    // ========================================
    // UPDATE REQUEST
    // ========================================
    const request =
      await updateRentalRequestStatus(
        id,
        req.user.userId,
        req.user.role,
        status
      );

    // ========================================
    // NOTIFY TENANT
    // ========================================
    try {
      const fullReq =
        await prisma.rentalRequest.findUnique(
          {
            where: {
              id,
            },

            include: {
              property: {
                select: {
                  titleEn: true,
                },
              },
            },
          }
        );

      if (fullReq?.tenantId) {
        const isApproved =
          status === "APPROVED";

        await notifyUser(
          fullReq.tenantId,

          isApproved
            ? "REQUEST_APPROVED"
            : "REQUEST_REJECTED",

          isApproved
            ? "Rental Request Approved! 🎉"
            : "Rental Request Update",

          isApproved
            ? `Your request for "${
                fullReq.property
                  ?.titleEn ||
                "property"
              }" has been approved. You can now proceed with payment.`
            : "Your rental request was declined.",

          "RentalRequest",

          id
        );
      }
    } catch (notificationError) {
      console.error(
        "Failed to notify tenant:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,

      message:
        status === "APPROVED"
          ? "Rental request approved and lease created successfully."
          : "Rental request status updated successfully.",

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
        error:
          "RENTAL_REQUEST_NOT_FOUND",
        message:
          "Rental request not found.",
      });
    }

    if (
      error.message === "FORBIDDEN"
    ) {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message:
          "You are not allowed to update this request.",
      });
    }

    if (
      error.message ===
      "REQUEST_ALREADY_PROCESSED"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "REQUEST_ALREADY_PROCESSED",
        message:
          "This rental request has already been processed.",
      });
    }

    if (
      error.message ===
      "START_DATE_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "START_DATE_REQUIRED",
        message:
          "A lease start date is required before approving this request.",
      });
    }

    if (
      error.message ===
      "END_DATE_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "END_DATE_REQUIRED",
        message:
          "A lease end date is required before approving this request.",
      });
    }

    if (
      error.message ===
      "END_DATE_BEFORE_START_DATE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "END_DATE_BEFORE_START_DATE",
        message:
          "The lease end date cannot be before the start date.",
      });
    }

    if (
      error.message ===
      "PROPERTY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        error:
          "PROPERTY_NOT_FOUND",
        message:
          "Property not found.",
      });
    }

    if (
      error.message ===
      "PROPERTY_NOT_AVAILABLE"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "PROPERTY_NOT_AVAILABLE",
        message:
          "This property is no longer available.",
      });
    }

    if (
      error.message ===
      "ALREADY_RENTING"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "ALREADY_RENTING",
        message:
          "This tenant already has an active lease for this property.",
      });
    }

    if (
      error.message ===
      "INVALID_RENT_AMOUNT"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "INVALID_RENT_AMOUNT",
        message:
          "The lease rent amount is invalid.",
      });
    }

    return res.status(500).json({
      success: false,
      error:
        "RENTAL_REQUEST_UPDATE_FAILED",
      message:
        "Something went wrong while updating the request.",
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
  createRequest,
  listRequests,
  updateRequestStatus,
};