const express = require("express");
const router = express.Router();

const {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  toggleUserActive,
  updateUserRole,
  createRole,
  getPaymentsSummary,
  deleteUser,
} = require("../controllers/adminController");

const {
  verifyToken,
  requireAdmin,
} = require("../middleware/authMiddleware");
console.log("=== ADMIN ROUTES CHECK ===");
console.log("getPendingProperties:", typeof getPendingProperties);
console.log("approveProperty:", typeof approveProperty);
console.log("rejectProperty:", typeof rejectProperty);
console.log("getAllUsers:", typeof getAllUsers);
console.log("toggleUserActive:", typeof toggleUserActive);
console.log("updateUserRole:", typeof updateUserRole);
console.log("createRole:", typeof createRole);
console.log("getPaymentsSummary:", typeof getPaymentsSummary);
console.log("deleteUser:", typeof deleteUser);
console.log("verifyToken:", typeof verifyToken);
console.log("requireAdmin:", typeof requireAdmin);
// ============================================================
// ADMIN PROPERTY MANAGEMENT
// ============================================================

// Get all pending properties
router.get(
  "/properties/pending",
  verifyToken,
  requireAdmin,
  getPendingProperties
);

// Approve property
router.patch(
  "/properties/:id/approve",
  verifyToken,
  requireAdmin,
  approveProperty
);

// Reject property
router.patch(
  "/properties/:id/reject",
  verifyToken,
  requireAdmin,
  rejectProperty
);

// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

// Get all users
router.get(
  "/users",
  verifyToken,
  requireAdmin,
  getAllUsers
);

// Activate / Deactivate user
router.patch(
  "/users/:id/toggle-active",
  verifyToken,
  requireAdmin,
  toggleUserActive
);

// Delete user
router.delete(
  "/users/:id",
  verifyToken,
  requireAdmin,
  deleteUser
);

// Change user role
router.patch(
  "/users/:id/role",
  verifyToken,
  requireAdmin,
  updateUserRole
);

// Create role
router.post(
  "/roles",
  verifyToken,
  requireAdmin,
  createRole
);

// ============================================================
// ADMIN FINANCIAL ANALYTICS
// ============================================================

// Payments summary
router.get(
  "/payments-summary",
  verifyToken,
  requireAdmin,
  getPaymentsSummary
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;