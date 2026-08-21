const express = require('express');
const router = express.Router();
const { getCategories, getLocations } = require('../controllers/lookupController');

router.get('/categories', getCategories);
router.get('/locations', getLocations);

module.exports = router;