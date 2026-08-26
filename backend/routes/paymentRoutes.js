const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, chapaWebhook } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route to initiate payment and get Chapa checkout URL
router.post('/initiate', verifyToken, initiatePayment);

// Route to verify payment by transaction reference
router.get('/verify/:tx_ref', verifyPayment);

// Route for Chapa webhook notifications
router.post('/webhook', chapaWebhook);

module.exports = router;