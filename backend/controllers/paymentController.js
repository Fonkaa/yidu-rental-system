import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const initiatePayment = async (req, res) => {
  try {
    const { leaseId, amount, email, firstName, lastName, phoneNumber, method, specificBank } = req.body;

    if (!leaseId || !amount || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, error: "Valid leaseId and numeric amount are required." });
    }

    const numericAmount = Number(amount);
    const commissionAmount = numericAmount * 0.10;
    const totalAmount = numericAmount + commissionAmount;
    const validEmail = (email && email.includes('@')) ? email : "tenant.user@domain.com";
    const tx_ref = `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now()}`;

    // --- ACCURATE METHOD & BANK LABEL RESOLUTION ---
    let savedMethodLabel = "Telebirr";

    if (method === 'CARD') {
      savedMethodLabel = "Cards";
    } else if (method === 'CBE_BIRR') {
      savedMethodLabel = "CBE Birr";
    } else if (method === 'BANK') {
      savedMethodLabel = specificBank && specificBank.trim() !== "" ? specificBank : "Commercial Bank of Ethiopia (CBE)";
    } else if (method === 'TELEBIRR') {
      savedMethodLabel = "Telebirr";
    }

    let shortTitle = `Pay ${savedMethodLabel}`;
    if (shortTitle.length > 16) shortTitle = "Rent Payment";

    let cleanPhone = "0901072272";
    if (phoneNumber && /^(09|07|\+?251)\d{8,9}$/.test(phoneNumber.trim())) {
      cleanPhone = phoneNumber.trim();
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const returnUrl = `${frontendUrl}?success=true&tx_ref=${tx_ref}`;

    const chapaPayload = {
      amount: totalAmount.toString(),
      currency: 'ETB',
      email: validEmail,
      first_name: firstName || "Tenant",
      last_name: lastName || "User",
      phone_number: cleanPhone,
      tx_ref: tx_ref,
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
      return_url: returnUrl,
      customization: {
        title: shortTitle,
        description: "Monthly Rent and Fee Settlement",
      }
    };

    if (method !== 'CARD') {
      chapaPayload.meta = {
        custom_receipt_enabled: true,
        payment_method_selected: savedMethodLabel,
        payment_reason: "Monthly Lease Rent & Platform Fee Settlement",
        invoices: [
          { key: "Monthly Rent", value: `${numericAmount} ETB` },
          { key: "Platform Commission (10%)", value: `${commissionAmount} ETB` },
          { key: "Method", value: savedMethodLabel }
        ]
      };
    }

    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const checkout_url = chapaResponse.data?.data?.checkout_url;
    if (!checkout_url) {
      throw new Error("Invalid response received from payment gateway provider.");
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { leaseId: String(leaseId) }
    });

    // --- SAVE THE EXACT RESOLVED LABEL TO NEON POSTGRESQL ---
    if (existingPayment) {
      await prisma.payment.update({
        where: { leaseId: String(leaseId) },
        data: { 
          amount: totalAmount, 
          commissionAmount, 
          gatewayTransactionId: tx_ref, 
          method: savedMethodLabel, 
          status: 'PENDING' 
        },
      });
    } else {
      await prisma.payment.create({
        data: { 
          leaseId: String(leaseId), 
          amount: totalAmount, 
          commissionAmount, 
          gatewayTransactionId: tx_ref, 
          method: savedMethodLabel, 
          status: 'PENDING' 
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: { checkout_url, tx_ref },
    });

  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error("Payment Initialization Failure:", errorDetails);
    return res.status(500).json({ success: false, error: typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails) });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({ success: false, error: "Transaction reference is required." });
    }

    const payment = await prisma.payment.findUnique({
      where: { gatewayTransactionId: tx_ref }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found." });
    }

    return res.status(200).json({
      success: true,
      payment: {
        method: payment.method,
        status: payment.status,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({ success: false, error: "Internal server error during verification." });
  }
};

export const chapaWebhook = async (req, res) => {
  try {
    const eventData = req.body;
    const tx_ref = eventData?.tx_ref;
    const status = eventData?.status;

    if (!tx_ref) {
      return res.status(400).json({ success: false, error: "Missing transaction reference." });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { gatewayTransactionId: tx_ref },
    });

    if (existingPayment && existingPayment.status !== 'SUCCESS') {
      const isSuccess = status === 'success' || status === 'SUCCESS';
      const newStatus = isSuccess ? 'SUCCESS' : 'FAILED';

      await prisma.payment.update({
        where: { gatewayTransactionId: tx_ref },
        data: { status: newStatus, paidAt: isSuccess ? new Date() : null },
      });
    }

    return res.status(200).json({ success: true, message: "Webhook processed successfully." });
  } catch (error) {
    console.error("Webhook Execution Error:", error);
    return res.status(500).json({ success: false, error: "Internal server error during webhook processing." });
  }
};