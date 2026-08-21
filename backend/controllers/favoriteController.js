const { addFavorite, listFavorites, removeFavorite } = require('../services/favoriteService');

async function createFavorite(req, res) {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId is required' });
    }

    const favorite = await addFavorite(userId, propertyId);
    return res.status(201).json(favorite);
  } catch (error) {
    console.error(error);
    if (error.message === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({ error: 'Property not found' });
    }
    return res.status(500).json({ error: 'Something went wrong while saving favorite' });
  }
}

async function getFavorites(req, res) {
  try {
    const favorites = await listFavorites(req.user.userId);
    return res.json(favorites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong while fetching favorites' });
  }
}

async function deleteFavorite(req, res) {
  try {
    const { propertyId } = req.params;
    const favorite = await removeFavorite(req.user.userId, propertyId);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.json({ message: 'Favorite removed', favorite });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong while removing favorite' });
  }
}

module.exports = {
  createFavorite,
  getFavorites,
  deleteFavorite,
};
