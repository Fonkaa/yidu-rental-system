
const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { notifyUser } = require("../services/notificationService");

console.log(
  "Loading Email Config:",
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS ? "Password Loaded" : "Password Missing"
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==========================================
// REGISTER
// ==========================================

async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "fullName, email, and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const allowedRoles = ["TENANT", "LANDLORD", "ADMIN"];
    const finalRole = allowedRoles.includes(role) ? role : "TENANT";

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: finalRole,
      },
    });

    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      for (const admin of admins) {
        await notifyUser(
          admin.id,
          "NEW_USER_REGISTERED",
          "New User Registration",
          `A new ${user.role.toLowerCase()} (${user.fullName}) has registered on the platform.`,
          "User",
          user.id,
          req
        );
      }
    } catch (notifErr) {
      console.error(
        "Failed to notify admins about new user registration:",
        notifErr
      );
    }

    return res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong during registration",
    });
  }
}

// ==========================================
// LOGIN
// ==========================================

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "This account has been deactivated",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong during login",
    });
  }
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, an OTP has been sent",
      });
    }

    const otpCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await prisma.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpiry,
      },
    });

    await transporter.sendMail({
      from: `"HouseRental Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP Code - HouseRental",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>HouseRental Security Verification</h2>

          <p>You requested a password reset for your account.</p>

          <p>Your one-time verification OTP code is:</p>

          <div style="margin: 20px 0;">
            <span style="
              background: #FFC107;
              color: #022036;
              font-size: 28px;
              font-weight: bold;
              padding: 12px 24px;
              display: inline-block;
              border-radius: 12px;
              letter-spacing: 6px;
            ">
              ${otpCode}
            </span>
          </div>

          <p>This code will expire in <strong>10 minutes</strong>.</p>

          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "If that email exists, an OTP has been sent",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong sending OTP email",
    });
  }
}

// ==========================================
// RESET PASSWORD
// ==========================================

async function resetPassword(req, res) {
  try {
    const {
      email,
      otpCode,
      newPassword,
    } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({
        error: "Email, OTP code, and new password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.otpCode || !user.otpExpiry) {
      return res.status(400).json({
        error: "Invalid request or OTP not requested",
      });
    }

    if (user.otpCode !== otpCode) {
      return res.status(400).json({
        error: "Incorrect OTP code",
      });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({
        error: "OTP has expired. Please request a new one",
      });
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiry: null,
      },
    });

    return res.status(200).json({
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong resetting password",
    });
  }
}

// ==========================================
// UPDATE FAYDA
// ==========================================

async function updateIdNumber(req, res) {
  try {
    console.log("FAYDA BODY:", req.body);
    console.log("FAYDA FILES:", req.files);

    const idNumber = req.body?.idNumber?.trim();

    if (!idNumber) {
      return res.status(400).json({
        error: "Fayda ID number is required",
      });
    }

    if (!/^\d{16}$/.test(idNumber)) {
      return res.status(400).json({
        error: "Fayda ID number must be exactly 16 digits",
      });
    }

    const frontImage =
      req.files?.faydaFrontImage?.[0];

    const backImage =
      req.files?.faydaBackImage?.[0];

    if (!frontImage) {
      return res.status(400).json({
        error: "Fayda front image is required",
      });
    }

    if (!backImage) {
      return res.status(400).json({
        error: "Fayda back image is required",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const updated = await prisma.user.update({
      where: {
        id: req.user.userId,
      },

      data: {
        faydaNumber: idNumber,

        faydaFrontImage:
          `/uploads/fayda/${frontImage.filename}`,

        faydaBackImage:
          `/uploads/fayda/${backImage.filename}`,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        faydaNumber: true,
        faydaFrontImage: true,
        faydaBackImage: true,
      },
    });

    return res.status(200).json({
      message: "Fayda information saved successfully",

      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,

        idNumber: updated.faydaNumber,

        faydaFrontImage:
          updated.faydaFrontImage,

        faydaBackImage:
          updated.faydaBackImage,
      },
    });
  } catch (error) {
    console.error("UPDATE FAYDA ERROR:", error);

    return res.status(500).json({
      error:
        "Something went wrong updating your Fayda information",
    });
  }
}

// ==========================================
// GET CURRENT USER
// ==========================================

async function getMe(req, res) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        faydaNumber: true,
        faydaFrontImage: true,
        faydaBackImage: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        ...user,
        idNumber: user.faydaNumber,
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong fetching your profile",
    });
  }
}

// ==========================================
// SEARCH LANDLORDS
// ==========================================

async function searchUsers(req, res) {
  try {
    const { q } = req.query;

    const currentUserId = req.user?.userId;

    const whereClause = {
      NOT: {
        id: currentUserId,
      },

      role: "LANDLORD",
    };

    if (q && q.trim() !== "") {
      whereClause.OR = [
        {
          fullName: {
            contains: q,
            mode: "insensitive",
          },
        },

        {
          email: {
            contains: q,
            mode: "insensitive",
          },
        },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },

      take: 10,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to search landlords",
    });
  }
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateIdNumber,
  getMe,
  searchUsers,
};