const express = require('express');

const router = express.Router();

const {
  getCategories
} = require('../controllers/categoryController');

const {
  verifyToken
} = require('../middleware/authMiddleware');

// Get all categories
router.get('/', verifyToken, getCategories);

module.exports = router;