const prisma = require('../prisma/client');

// ==========================================
// GET ALL CATEGORIES
// ==========================================

async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('GET CATEGORIES ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      details: error.message
    });
  }
}

module.exports = {
  getCategories
};