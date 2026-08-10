const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');


router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'You are logged in', user: req.user });
});

module.exports = router;