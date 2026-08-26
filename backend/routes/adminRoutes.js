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
  getPaymentsSummary // <-- 1. Imported here
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/properties/pending', verifyToken, requireAdmin, getPendingProperties);
router.patch('/properties/:id/approve', verifyToken, requireAdmin, approveProperty);
router.patch('/properties/:id/reject', verifyToken, requireAdmin, rejectProperty);
router.get('/users', verifyToken, requireAdmin, getAllUsers);
router.patch('/users/:id/toggle-active', verifyToken, requireAdmin, toggleUserActive);

// New Role Management Routes
router.patch('/users/:id/role', verifyToken, requireAdmin, updateUserRole);
router.post('/roles', verifyToken, requireAdmin, createRole);

// New Financial Analytics & Payments Summary Route
router.get('/payments-summary', verifyToken, requireAdmin, getPaymentsSummary); // <-- 2. Added here

module.exports = router;