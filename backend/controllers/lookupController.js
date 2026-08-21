const prisma = require('../prisma/client');

async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching categories' });
  }
}

async function getLocations(req, res) {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching locations' });
  }
}

module.exports = { getCategories, getLocations };