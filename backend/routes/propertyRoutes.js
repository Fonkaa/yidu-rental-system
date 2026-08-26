const express = require('express');
const router = express.Router();
const { 
  getProperties, 
  getPropertyById, 
  createProperty, 
  uploadImages, 
  updateProperty, 
  updatePropertyStatus, 
  approveProperty, 
  rejectProperty, 
  renewProperty, 
  getMyProperties 
} = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// 1. Static / specific routes MUST come completely before dynamic routes
router.get('/', getProperties);
router.get('/mine', verifyToken, getMyProperties); // <-- Placed BEFORE /:id

// 2. Dynamic parameter route comes AFTER specific routes
router.get('/:id', getPropertyById);

// 3. Action & modification routes
router.post('/', verifyToken, createProperty);
router.post('/:id/images', verifyToken, upload.array('images', 10), uploadImages);
router.put('/:id', verifyToken, upload.array('images', 10), updateProperty); // <-- FIXED: Added multer here!
router.patch('/:id/status', verifyToken, updatePropertyStatus);
router.patch('/:id/renew', verifyToken, renewProperty);

module.exports = router;