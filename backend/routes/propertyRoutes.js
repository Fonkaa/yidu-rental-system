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

router.get('/', getProperties);
router.get('/mine', verifyToken, getMyProperties);
router.get('/financial-summary', verifyToken, getLandlordFinancialSummary);

// Approved properties for public Home page
router.get('/approved', getProperties);

// Dynamic parameter route comes AFTER specific routes
router.get('/:id', getPropertyById);

// 3. Action & modification routes (Updated to include ownershipDocument)
router.post('/', verifyToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'ownershipDocument', maxCount: 1 } // <--- አዲሱ የሰነድ ጫኝ (Map Plan Document)
]), createProperty);

router.post('/:id/images', verifyToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'ownershipDocument', maxCount: 1 } // <--- አዲስ ሰነድ ለመጨመር/ለማሻሻል
]), uploadImages);

router.put('/:id', verifyToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'ownershipDocument', maxCount: 1 } // <--- በ Update ጊዜ አብሮ እንዲላክ
]), updateProperty);

router.patch('/:id/status', verifyToken, updatePropertyStatus);
router.patch('/:id/renew', verifyToken, renewProperty);
router.delete('/:id', verifyToken, deleteProperty);

module.exports = router;