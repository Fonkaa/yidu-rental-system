const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { notifyUser } = require('../services/notificationService');

console.log("Loading Email Config:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? "Password Loaded" : "Password Missing");

// Configure Nodemailer transporter using your .env credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==========================================
// DATABASE CONNECTION RETRY HELPER
// ==========================================
async function executeWithRetry(operation, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.code === 'P1001' || 
        error.message?.includes("Can't reach database server") ||
        error.message?.includes("PrismaClientInitializationError");

      if (isConnectionError && i < retries - 1) {
        console.warn(`Database connection lost. Retrying attempt ${i + 2} in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email, and password are required' });
    }

    const existingUser = await executeWithRetry(() => prisma.user.findUnique({ where: { email } }));
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const allowedRoles = ['TENANT', 'LANDLORD', 'ADMIN'];
    const finalRole = allowedRoles.includes(role) ? role : 'TENANT';

    const user = await executeWithRetry(() =>
      prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          role: finalRole,
        },
      })
    );

    // --- NOTIFY ALL ADMINS ABOUT NEW USER REGISTRATION ---
    try {
      const admins = await executeWithRetry(() =>
        prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true }
        })
      );

      for (const admin of admins) {
        await notifyUser(
          admin.id,
          'NEW_USER_REGISTERED',
          'New User Registration 👤',
          `A new ${user.role.toLowerCase()} (${user.fullName}) has registered on the platform.`,
          'User',
          user.id,
          req
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify admins about new user registration:", notifErr);
    }

    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during registration', details: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await executeWithRetry(() => prisma.user.findUnique({ where: { email } }));
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during login', details: error.message });
  }
}

// 1. FORGOT PASSWORD (Generates 6-digit OTP & Emails the User Directly)
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await executeWithRetry(() => prisma.user.findUnique({ where: { email } }));
    if (!user) {
      // Return a safe generic message so hackers can't check if an email exists
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent' });
    }

    // Generate random 6-digit OTP code & 10-minute expiration
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await executeWithRetry(() =>
      prisma.user.update({
        where: { email },
        data: { otpCode, otpExpiry },
      })
    );

    // Send email to the specific registered user's address
    await transporter.sendMail({
      from: `"HouseRental Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP Code - HouseRental",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #022036; margin-bottom: 8px;">HouseRental Security Verification</h2>
          <p style="color: #64748b; font-size: 14px;">You requested a password reset for your account.</p>
          <p style="font-size: 14px; margin-top: 16px;">Your one-time verification OTP code is:</p>
          <div style="margin: 20px 0;">
            <span style="background: #FFC107; color: #022036; font-size: 28px; font-weight: bold; padding: 12px 24px; display: inline-block; border-radius: 12px; letter-spacing: 6px;">${otpCode}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code will expire in <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'If that email exists, an OTP has been sent' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: 'Something went wrong sending OTP email', details: error.message });
  }
}

// 2. RESET PASSWORD WITH OTP (Single, Clean Definition)
async function resetPassword(req, res) {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
    }

    const user = await executeWithRetry(() => prisma.user.findUnique({ where: { email } }));
    if (!user || !user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid request or OTP not requested' });
    }

    if (user.otpCode !== otpCode) {
      return res.status(400).json({ error: 'Incorrect OTP code' });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await executeWithRetry(() =>
      prisma.user.update({
        where: { id: user.id },
        data: { 
          passwordHash, 
          otpCode: null, 
          otpExpiry: null 
        },
      })
    );

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: 'Something went wrong resetting password', details: error.message });
  }
}

async function updateIdNumber(req, res) {
  try {
    const { idNumber } = req.body;
    if (!idNumber) {
      return res.status(400).json({ error: 'idNumber is required' });
    }

    const updated = await executeWithRetry(() =>
      prisma.user.update({
        where: { id: req.user.userId },
        data: { faydaNumber: idNumber },
        select: { id: true, fullName: true, email: true, faydaNumber: true },
      })
    );

    res.json({
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      idNumber: updated.faydaNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating your ID number', details: error.message });
  }
}

async function getMe(req, res) {
  try {
    const user = await executeWithRetry(() =>
      prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, fullName: true, email: true, role: true, faydaNumber: true, phone: true },
      })
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        ...user,
        idNumber: user.faydaNumber
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching your profile', details: error.message });
  }
}

// SEARCH USERS (Strictly filtered to return LANDLORDS)
async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const currentUserId = req.user?.userId;

    const whereClause = {
      NOT: { id: currentUserId },
      role: 'LANDLORD',
    };

    if (q && q.trim() !== "") {
      whereClause.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const users = await executeWithRetry(() =>
      prisma.user.findMany({
        where: whereClause,
        select: { id: true, fullName: true, email: true, role: true },
        take: 10
      })
    );

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to search landlords", details: error.message });
  }
}

module.exports = { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  updateIdNumber, 
  getMe, 
  searchUsers 
};