const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  updateIdNumber, 
  verifyFayda,
  getMe, 
  searchUsers 
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword); // Expects { email, otpCode, newPassword }
router.patch('/id-number', verifyToken, updateIdNumber);

// Fayda digital ID verification route with multi-part image fields
router.post(
  '/verify-fayda',
  verifyToken,
  upload.fields([
    { name: 'faydaFrontImage', maxCount: 1 },
    { name: 'faydaBackImage', maxCount: 1 }
  ]),
  verifyFayda
);

router.get('/me', verifyToken, getMe);
router.get('/search', verifyToken, searchUsers);

module.exports = router;