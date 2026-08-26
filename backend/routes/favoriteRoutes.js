const express = require('express');
const router = express.Router();
const { getFavorites, createFavorite, deleteFavorite } = require('../controllers/favoriteController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getFavorites);
router.post('/', verifyToken, createFavorite);
router.delete('/:propertyId', verifyToken, deleteFavorite);

module.exports = router;