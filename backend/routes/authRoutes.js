const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, updateIdNumber, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/id-number', verifyToken, updateIdNumber);
router.get('/me', verifyToken, getMe);

module.exports = router;