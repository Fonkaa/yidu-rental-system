const prisma = require("../prisma/client");
const axios = require("axios");
const crypto = require("crypto");
const { notifyUser } = require("../services/notificationService");

const CHAPA_INITIALIZE_URL =
  "https://api.chapa.co/v1/transaction/initialize";

const CHAPA_VERIFY_URL =
  "https://api.chapa.co/v1/transaction/verify";

// ============================================================
// HELPERS
// ============================================================

const getChapaHeaders = () => ({
  Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
  "Content-Type": "application/json",
});

// Chapa only accepts letters, numbers, hyphens, underscores, spaces, and dots
// in customization fields (title/description). Strip anything else.
const sanitizeChapaText = (text) =>
  String(text || "")
    .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

// ============================================================
// ACTIVATE LEASE AFTER SUCCESSFUL PAYMENT
// ============================================================

const activateLeaseAfterPayment = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      lease: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!payment || !payment.lease) {
    throw new Error(
      "Payment or associated lease not found."
    );
  }

  // Activate lease
  await prisma.lease.update({
    where: {
      id: payment.leaseId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  // Mark property as rented
  await prisma.property.update({
    where: {
      id: payment.lease.propertyId,
    },
    data: {
      status: "RENTED",
    },
  });

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  try {
    const tenantId =
      payment.lease.tenantId;

    const landlordId =
      payment.lease.property.landlordId;

    const propertyTitle =
      payment.lease.property.titleEn ||
      "Property";

    const paidAmount =
      Number(payment.amount).toLocaleString();

    // Tenant notification
    if (tenantId) {
      await notifyUser(
        tenantId,
        "PAYMENT_SUCCESS",
        "Payment Completed Successfully! 💳",
        `Your payment of ${paidAmount} ETB for "${propertyTitle}" has been confirmed.`,
        "Payment",
        payment.id
      );
    }

    // Landlord notification
    if (landlordId) {
      await notifyUser(
        landlordId,
        "RENT_RECEIVED",
        "Rent Payment Received! 💰",
        `A payment of ${paidAmount} ETB has been confirmed for "${propertyTitle}".`,
        "Payment",
        payment.id
      );
    }
  } catch (notificationError) {
    console.error(
      "Payment notification error:",
      notificationError.message
    );
  }

  return payment;
};

// ============================================================
// INITIATE CHAPA PAYMENT
// ============================================================

const initiatePayment = async (req, res) => {
  try {
    const {
      leaseId,
      rentalRequestId,
      amount,
      email,
      firstName,
      lastName,
      phoneNumber,
      method,
      specificBank,
    } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!leaseId && !rentalRequestId) {
      return res.status(400).json({
        success: false,
        error:
          "leaseId or rentalRequestId is required.",
      });
    }

    if (
      !amount ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "A valid payment amount is required.",
      });
    }

    if (!process.env.CHAPA_SECRET_KEY) {
      console.error(
        "CHAPA_SECRET_KEY is missing from .env"
      );

      return res.status(500).json({
        success: false,
        error:
          "Chapa payment configuration is missing.",
      });
    }

    // ========================================================
    // FIND LEASE
    // ========================================================

    let lease = null;

    // --------------------------------------------------------
    // FIRST: FIND USING leaseId
    // --------------------------------------------------------

    if (leaseId) {
      lease = await prisma.lease.findUnique({
        where: {
          id: String(leaseId),
        },
        include: {
          property: true,
          tenant: true,
          payment: true,
        },
      });
    }

    // --------------------------------------------------------
    // SECOND: IF NO LEASE FOUND, USE rentalRequestId
    // --------------------------------------------------------

    if (!lease && rentalRequestId) {
      console.log(
        "Lease not found by leaseId. Trying rentalRequestId:",
        rentalRequestId
      );

      const rentalRequest =
        await prisma.rentalRequest.findUnique({
          where: {
            id: String(rentalRequestId),
          },
          include: {
            property: true,
            tenant: true,
          },
        });

      if (!rentalRequest) {
        return res.status(404).json({
          success: false,
          error:
            "Rental request not found.",
        });
      }

      // ------------------------------------------------------
      // FIND LEASE USING TENANT + PROPERTY
      // ------------------------------------------------------

      lease = await prisma.lease.findFirst({
        where: {
          tenantId: rentalRequest.tenantId,
          propertyId: rentalRequest.propertyId,
        },
        include: {
          property: true,
          tenant: true,
          payment: true,
        },
      });
    }

    // ========================================================
    // LEASE STILL DOES NOT EXIST
    // ========================================================

    if (!lease) {
      return res.status(404).json({
        success: false,
        error:
          "Lease not found. The rental request must be approved by the landlord before payment can be made.",
        code: "LEASE_NOT_FOUND",
      });
    }

    console.log(
      "Lease found successfully:",
      lease.id
    );

    // ========================================================
    // SECURITY CHECK
    // ========================================================

    if (
      req.user &&
      lease.tenantId &&
      lease.tenantId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You are not authorized to pay for this lease.",
      });
    }

    // ========================================================
    // PREVENT DOUBLE PAYMENT
    // ========================================================

    if (
      lease.payment &&
      lease.payment.status === "SUCCESS"
    ) {
      return res.status(409).json({
        success: false,
        error:
          "This lease has already been paid.",
        payment: lease.payment,
      });
    }

    const numericAmount =
      Number(amount);

    // ========================================================
    // COMMISSION
    // ========================================================

    const commissionAmount = Number(
      (numericAmount * 0.10).toFixed(2)
    );

    const totalAmount = Number(
      (
        numericAmount +
        commissionAmount
      ).toFixed(2)
    );

    // ========================================================
    // CUSTOMER INFORMATION
    // ========================================================

    const validEmail =
      email &&
      email.includes("@")
        ? email
        : lease.tenant?.email;

    if (!validEmail) {
      return res.status(400).json({
        success: false,
        error:
          "A valid tenant email is required.",
      });
    }

    const cleanPhone =
      phoneNumber &&
      /^(09|07|\+?251)\d{8,9}$/.test(
        phoneNumber.trim()
      )
        ? phoneNumber.trim()
        : lease.tenant?.phone;

    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        error:
          "A valid Ethiopian phone number is required.",
      });
    }

    // ========================================================
    // PAYMENT METHOD LABEL
    // ========================================================

    let savedMethodLabel =
      "Chapa";

    if (method === "CARD") {
      savedMethodLabel =
        "Chapa Card";
    } else if (
      method === "CBE_BIRR"
    ) {
      savedMethodLabel =
        "CBE Birr";
    } else if (method === "BANK") {
      savedMethodLabel = specificBank
        ? `Bank - ${specificBank}`
        : "Bank";
    }

    // ========================================================
    // TRANSACTION REFERENCE
    // ========================================================

    const tx_ref =
      `RENT-${crypto
        .randomBytes(6)
        .toString("hex")
        .toUpperCase()}-${Date.now()}`;

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const backendUrl =
      process.env.BACKEND_URL ||
      "http://localhost:5000";

    // ========================================================
    // RETURN URL
    // ========================================================

    const returnUrl =
      `${frontendUrl}/rental-requests?tx_ref=${encodeURIComponent(
        tx_ref
      )}`;

    // ========================================================
    // CHAPA REQUEST
    // ========================================================

    const chapaPayload = {
      amount:
        totalAmount.toFixed(2),

      currency: "ETB",

      email: validEmail,

      first_name:
        sanitizeChapaText(
          firstName ||
          lease.tenant?.fullName?.split(" ")[0] ||
          "Tenant"
        ) || "Tenant",

      last_name:
        sanitizeChapaText(
          lastName ||
          lease.tenant?.fullName?.split(" ").slice(1).join(" ") ||
          "User"
        ) || "User",

      phone_number:
        cleanPhone,

      tx_ref,

      callback_url:
        `${backendUrl}/api/payments/webhook`,

      return_url:
        returnUrl,

      customization: {
        title:
          sanitizeChapaText("Rent Payment") || "Rent Payment",

        description:
          sanitizeChapaText(
            `Rent payment for ${lease.property?.titleEn || "Property"}`
          ) || "Rent payment",
      },
    };

    console.log(
      "Initializing Chapa payment:",
      {
        leaseId:
          lease.id,

        rentalRequestId:
          rentalRequestId ||
          null,

        tx_ref,

        amount:
          totalAmount,
      }
    );

    // ========================================================
    // CALL CHAPA
    // ========================================================

    let chapaResponse;

    try {
      chapaResponse =
        await axios.post(
          CHAPA_INITIALIZE_URL,
          chapaPayload,
          {
            headers:
              getChapaHeaders(),

            timeout: 15000,
          }
        );
    } catch (chapaError) {
      console.error(
        "Chapa initialization failed:",
        chapaError.response
          ?.data ||
          chapaError.message
      );

      return res.status(502).json({
        success: false,
        error:
          chapaError.response
            ?.data?.message ||
          "Unable to initialize payment with Chapa.",
      });
    }

    // ========================================================
    // GET CHECKOUT URL
    // ========================================================

    const checkoutUrl =
      chapaResponse.data
        ?.data
        ?.checkout_url;

    if (!checkoutUrl) {
      console.error(
        "Chapa did not return checkout_url:",
        chapaResponse.data
      );

      return res.status(502).json({
        success: false,
        error:
          "Chapa did not return a checkout URL.",
      });
    }

    // ========================================================
    // CREATE / UPDATE PAYMENT
    // ========================================================

    let payment;

    if (lease.payment) {
      payment =
        await prisma.payment.update({
          where: {
            id: lease.payment.id,
          },

          data: {
            amount:
              totalAmount,

            commissionAmount,

            gatewayTransactionId:
              tx_ref,

            method:
              savedMethodLabel,

            status:
              "PENDING",

            paidAt:
              null,
          },
        });
    } else {
      payment =
        await prisma.payment.create({
          data: {
            leaseId:
              lease.id,

            amount:
              totalAmount,

            commissionAmount,

            gatewayTransactionId:
              tx_ref,

            method:
              savedMethodLabel,

            status:
              "PENDING",
          },
        });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Payment initialized successfully.",

      data: {
        paymentId:
          payment.id,

        leaseId:
          lease.id,

        tx_ref,

        amount:
          totalAmount,

        commissionAmount,

        checkout_url:
          checkoutUrl,
      },
    });
  } catch (error) {
    console.error(
      "Payment initialization error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      error:
        "Payment initialization failed.",
    });
  }
};

// ============================================================
// VERIFY CHAPA PAYMENT
// ============================================================

const verifyPayment = async (
  req,
  res
) => {
  try {
    const {
      tx_ref,
    } = req.params;

    if (!tx_ref) {
      return res.status(400).json({
        success: false,
        error:
          "Transaction reference is required.",
      });
    }

    if (
      !process.env.CHAPA_SECRET_KEY
    ) {
      return res.status(500).json({
        success: false,
        error:
          "Chapa payment configuration is missing.",
      });
    }

    // ========================================================
    // VERIFY WITH CHAPA
    // ========================================================

    let chapaResponse;

    try {
      chapaResponse =
        await axios.get(
          `${CHAPA_VERIFY_URL}/${encodeURIComponent(
            tx_ref
          )}`,
          {
            headers:
              getChapaHeaders(),

            timeout: 15000,
          }
        );
    } catch (chapaError) {
      console.error(
        "Chapa verification failed:",
        chapaError.response
          ?.data ||
          chapaError.message
      );

      return res.status(502).json({
        success: false,
        error:
          "Unable to verify payment with Chapa.",
      });
    }

    const chapaData =
      chapaResponse.data?.data;

    const chapaStatus =
      chapaData?.status ||
      chapaResponse.data?.status;

    // ========================================================
    // FIND PAYMENT
    // ========================================================

    let payment =
      await prisma.payment.findFirst({
        where: {
          gatewayTransactionId:
            tx_ref,
        },

        include: {
          lease: {
            include: {
              property: true,
            },
          },
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error:
          "Payment record not found.",
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    if (
      chapaStatus === "success" ||
      chapaStatus === "SUCCESS"
    ) {
      payment =
        await prisma.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            status:
              "SUCCESS",

            paidAt:
              new Date(),
          },

          include: {
            lease: {
              include: {
                property: true,
              },
            },
          },
        });

      await activateLeaseAfterPayment(
        payment.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Payment verified successfully.",

        payment: {
          id:
            payment.id,

          status:
            "SUCCESS",

          amount:
            Number(payment.amount),

          tx_ref,
        },
      });
    }

    // ========================================================
    // FAILED
    // ========================================================

    if (
      chapaStatus === "failed" ||
      chapaStatus === "FAILED"
    ) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status:
            "FAILED",
        },
      });

      return res.status(200).json({
        success: false,

        message:
          "Payment was not successful.",

        payment: {
          id:
            payment.id,

          status:
            "FAILED",

          amount:
            Number(payment.amount),

          tx_ref,
        },
      });
    }

    // ========================================================
    // PENDING
    // ========================================================

    return res.status(200).json({
      success: false,

      message:
        "Payment is still pending.",

      payment: {
        id:
          payment.id,

        status:
          "PENDING",

        amount:
          Number(payment.amount),

        tx_ref,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      error:
        "Verification error.",
    });
  }
};

// ============================================================
// CHAPA WEBHOOK
// ============================================================

const chapaWebhook = async (
  req,
  res
) => {
  try {
    console.log(
      "Chapa webhook received:",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    const webhookData =
      req.body?.data ||
      req.body;

    const tx_ref =
      webhookData?.tx_ref ||
      webhookData?.reference ||
      webhookData?.transaction_reference;

    if (!tx_ref) {
      return res.status(200).json({
        success: true,
        message:
          "Webhook received without transaction reference.",
      });
    }

    // ========================================================
    // CHAPA SECRET
    // ========================================================

    if (
      !process.env.CHAPA_SECRET_KEY
    ) {
      console.error(
        "CHAPA_SECRET_KEY is missing."
      );

      return res.status(200).json({
        success: true,
        message:
          "Webhook received.",
      });
    }

    // ========================================================
    // VERIFY DIRECTLY WITH CHAPA
    // ========================================================

    let chapaResponse;

    try {
      chapaResponse =
        await axios.get(
          `${CHAPA_VERIFY_URL}/${encodeURIComponent(
            tx_ref
          )}`,
          {
            headers:
              getChapaHeaders(),

            timeout: 15000,
          }
        );
    } catch (verificationError) {
      console.error(
        "Webhook Chapa verification failed:",
        verificationError.response
          ?.data ||
          verificationError.message
      );

      return res.status(200).json({
        success: true,
        message:
          "Webhook received.",
      });
    }

    const chapaStatus =
      chapaResponse.data
        ?.data
        ?.status ||
      chapaResponse.data
        ?.status;

    // ========================================================
    // ONLY PROCESS SUCCESS
    // ========================================================

    if (
      chapaStatus !== "success" &&
      chapaStatus !== "SUCCESS"
    ) {
      console.log(
        `Webhook payment ${tx_ref} status: ${chapaStatus}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Webhook received.",
      });
    }

    // ========================================================
    // FIND PAYMENT
    // ========================================================

    const payment =
      await prisma.payment.findFirst({
        where: {
          gatewayTransactionId:
            tx_ref,
        },
      });

    if (!payment) {
      console.warn(
        `No payment found for Chapa tx_ref: ${tx_ref}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Webhook received.",
      });
    }

    // ========================================================
    // IDEMPOTENCY
    // ========================================================

    if (
      payment.status === "SUCCESS"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Payment already processed.",
      });
    }

    // ========================================================
    // UPDATE PAYMENT
    // ========================================================

    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status:
          "SUCCESS",

        paidAt:
          new Date(),
      },
    });

    // ========================================================
    // ACTIVATE LEASE
    // ========================================================

    await activateLeaseAfterPayment(
      payment.id
    );

    return res.status(200).json({
      success: true,

      message:
        "Payment webhook processed successfully.",
    });
  } catch (error) {
    console.error(
      "Chapa webhook error:",
      error.response?.data ||
        error.message
    );

    // Always acknowledge webhook
    return res.status(200).json({
      success: true,
      message:
        "Webhook received.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  initiatePayment,
  verifyPayment,
  chapaWebhook,
};