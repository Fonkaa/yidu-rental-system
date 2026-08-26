const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Ensure functions exist before passing to router
if (typeof verifyToken !== 'function') {
  throw new Error("authMiddleware.verifyToken is not a valid function");
}
if (typeof getSettings !== 'function') {
  throw new Error("settingsController.getSettings is not a valid function");
}
if (typeof updateSettings !== 'function') {
  throw new Error("settingsController.updateSettings is not a valid function");
}

router.get('/', verifyToken, getSettings);
router.patch('/', verifyToken, updateSettings);

module.exports = router;