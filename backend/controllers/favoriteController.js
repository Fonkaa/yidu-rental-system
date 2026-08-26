const { addFavorite, listFavorites, removeFavorite } = require('../services/favoriteService');

function getAuthUserId(req) {
  return req.user?.id || req.user?.userId || req.user?._id;
}

async function createFavorite(req, res) {
  try {
    const userId = getAuthUserId(req);
    const { propertyId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId is required' });
    }

    const favorite = await addFavorite(userId, propertyId);
    return res.status(201).json(favorite);
  } catch (error) {
    console.error('CREATE FAVORITE ERROR:', error);
    if (error.message === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({ error: 'Property not found' });
    }
    return res.status(500).json({ error: error.message || 'Something went wrong while saving favorite' });
  }
}

async function getFavorites(req, res) {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const favorites = await listFavorites(userId);
    return res.json(favorites);
  } catch (error) {
    console.error('GET FAVORITES ERROR:', error);
    return res.status(500).json({ error: error.message || 'Something went wrong while fetching favorites' });
  }
}

async function deleteFavorite(req, res) {
  try {
    const userId = getAuthUserId(req);
    const { propertyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const favorite = await removeFavorite(userId, propertyId);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.json({ message: 'Favorite removed', favorite });
  } catch (error) {
    console.error('DELETE FAVORITE ERROR:', error);
    return res.status(500).json({ error: error.message || 'Something went wrong while removing favorite' });
  }
}

module.exports = {
  createFavorite,
  getFavorites,
  deleteFavorite,
};