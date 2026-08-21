const express = require('express');
const router = express.Router();
const { createFavorite, getFavorites, deleteFavorite } = require('../controllers/favoriteController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', getFavorites);
router.post('/', createFavorite);
router.delete('/:propertyId', deleteFavorite);

module.exports = router;
