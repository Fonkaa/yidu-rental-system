const express = require('express');

const router = express.Router();

const {
  getLocations
} = require('../controllers/locationController');

const {
  verifyToken
} = require('../middleware/authMiddleware');

// Get all locations
router.get('/', verifyToken, getLocations);

module.exports = router;