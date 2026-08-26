const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  updateIdNumber, 
  getMe, 
  searchUsers 
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword); // Expects { email, otpCode, newPassword }
router.patch('/id-number', verifyToken, updateIdNumber);
router.get('/me', verifyToken, getMe);
router.get('/search', verifyToken, searchUsers);

module.exports = router;