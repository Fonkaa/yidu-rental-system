const express = require('express');
const router = express.Router();
const { getCommissionRate, updateCommissionRate } = require('../controllers/settingsController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/commission-rate', verifyToken, requireAdmin, getCommissionRate);
router.patch('/commission-rate', verifyToken, requireAdmin, updateCommissionRate);

module.exports = router;