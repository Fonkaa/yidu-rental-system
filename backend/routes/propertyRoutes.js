const express = require('express');
const router = express.Router();
const { createProperty } = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createProperty);

module.exports = router;