const jwt = require("jsonwebtoken");

// ==========================================
// VERIFY JWT TOKEN
// ==========================================
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // ----------------------------------------
    // CHECK AUTHORIZATION HEADER
    // ----------------------------------------
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        error: "NO_TOKEN",
        message:
          "Authentication required. Please log in.",
      });
    }

    // ----------------------------------------
    // GET TOKEN
    // ----------------------------------------
    const token = authHeader
      .split(" ")[1]
      ?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "NO_TOKEN",
        message:
          "Authentication token is missing.",
      });
    }

    // ----------------------------------------
    // CHECK JWT SECRET
    // ----------------------------------------
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured in .env"
      );

      return res.status(500).json({
        success: false,
        error: "JWT_SECRET_MISSING",
        message:
          "Server authentication configuration is missing.",
      });
    }

    // ----------------------------------------
    // VERIFY TOKEN
    // ----------------------------------------
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /*
     * Your login token uses:
     *
     * {
     *   userId: user.id,
     *   role: user.role
     * }
     *
     * Keep userId as the main field.
     */

    const userId =
      decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN",
        message:
          "The authentication token does not contain a user ID.",
      });
    }

    // ----------------------------------------
    // ATTACH USER TO REQUEST
    // ----------------------------------------
    req.user = {
      ...decoded,
      userId,
    };

    next();
  } catch (error) {
    console.error(
      "AUTHENTICATION ERROR:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "TOKEN_EXPIRED",
        message:
          "Your session has expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN",
        message:
          "Your authentication token is invalid. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "AUTHENTICATION_FAILED",
      message:
        "Authentication failed. Please log in again.",
    });
  }
}

// ==========================================
// REQUIRE ADMIN
// ==========================================
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "AUTHENTICATION_REQUIRED",
      message:
        "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "ADMIN_ACCESS_REQUIRED",
      message:
        "Admin access required.",
    });
  }

  next();
}

// ==========================================
// REQUIRE TENANT
// ==========================================
function requireTenant(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "AUTHENTICATION_REQUIRED",
      message:
        "Authentication required.",
    });
  }

  if (req.user.role !== "TENANT") {
    return res.status(403).json({
      success: false,
      error: "TENANT_ACCESS_REQUIRED",
      message:
        "Only tenants can perform this action.",
    });
  }

  next();
}

// ==========================================
// REQUIRE LANDLORD
// ==========================================
function requireLandlord(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "AUTHENTICATION_REQUIRED",
      message:
        "Authentication required.",
    });
  }

  if (req.user.role !== "LANDLORD") {
    return res.status(403).json({
      success: false,
      error: "LANDLORD_ACCESS_REQUIRED",
      message:
        "Only landlords can perform this action.",
    });
  }

  next();
}

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  verifyToken,
  requireAdmin,
  requireTenant,
  requireLandlord,
};