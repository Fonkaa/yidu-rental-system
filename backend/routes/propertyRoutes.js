const express = require('express');
const router = express.Router();
const { createProperty, uploadImages } = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/', verifyToken, createProperty);
router.post('/:id/images', verifyToken, upload.array('images', 10), uploadImages);

module.exports = router;