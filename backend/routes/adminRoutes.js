const express = require('express');
const router = express.Router();
const { getPendingProperties, approveProperty, rejectProperty } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/properties/pending', verifyToken, requireAdmin, getPendingProperties);
router.patch('/properties/:id/approve', verifyToken, requireAdmin, approveProperty);
router.patch('/properties/:id/reject', verifyToken, requireAdmin, rejectProperty);

module.exports = router;