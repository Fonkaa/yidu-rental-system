const express = require('express');
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
} = require('../controllers/adminController');

const {
  verifyToken,
  requireAdmin,
} = require('../middleware/authMiddleware');

// ============================================================
// ADMIN PROPERTY MANAGEMENT
// ============================================================

// Get all pending properties
router.get(
  '/properties/pending',
  verifyToken,
  requireAdmin,
  getPendingProperties
);

// Approve property
router.patch(
  '/properties/:id/approve',
  verifyToken,
  requireAdmin,
  approveProperty
);

// Reject property
router.patch(
  '/properties/:id/reject',
  verifyToken,
  requireAdmin,
  rejectProperty
);

// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

// Get all users
router.get(
  '/users',
  verifyToken,
  requireAdmin,
  getAllUsers
);

// Activate / Deactivate user
// Uses Prisma Transaction in adminController.js
router.patch(
  '/users/:id/toggle-active',
  verifyToken,
  requireAdmin,
  toggleUserActive
);

// Delete user
router.delete(
  '/users/:id',
  verifyToken,
  requireAdmin,
  deleteUser
);

// Change user role
// TENANT / LANDLORD / ADMIN
// Uses Prisma Transaction in adminController.js
router.patch(
  '/users/:id/role',
  verifyToken,
  requireAdmin,
  updateUserRole
);

// Create role
router.post(
  '/roles',
  verifyToken,
  requireAdmin,
  createRole
);

// ============================================================
// ADMIN FINANCIAL ANALYTICS
// ============================================================

// Payments summary
router.get(
  '/payments-summary',
  verifyToken,
  requireAdmin,
  getPaymentsSummary
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;