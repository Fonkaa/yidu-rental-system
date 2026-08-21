const express = require('express');
const router = express.Router();
const { createLease, listLeases, updateLease } = require('../controllers/leaseController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', listLeases);
router.post('/', createLease);
router.patch('/:id/status', updateLease);

module.exports = router;
