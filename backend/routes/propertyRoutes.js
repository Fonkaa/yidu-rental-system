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
  getMyProperties,
  getLandlordFinancialSummary,
  deleteProperty 
} = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// 1. Static / specific routes MUST come completely before dynamic routes
router.get('/', getProperties);
router.get('/mine', verifyToken, getMyProperties);
router.get('/financial-summary', verifyToken, getLandlordFinancialSummary);

// 2. Dynamic parameter route comes AFTER specific routes
router.get('/:id', getPropertyById);

// 3. Action & modification routes (Updated with upload.fields to support optional video tour + images)
router.post('/', verifyToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), createProperty);

router.post('/:id/images', verifyToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), uploadImages);

router.put('/:id', verifyToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), updateProperty);

router.patch('/:id/status', verifyToken, updatePropertyStatus);
router.patch('/:id/renew', verifyToken, renewProperty);
router.delete('/:id', verifyToken, deleteProperty);

module.exports = router;