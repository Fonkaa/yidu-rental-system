const prisma = require('../prisma/client');

// ==========================================
// GET ALL LOCATIONS
// ==========================================

async function getLocations(req, res) {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [
        {
          city: 'asc'
        },
        {
          subCity: 'asc'
        }
      ],
      select: {
        id: true,
        city: true,
        subCity: true,
        kebeleOrWoreda: true,
        region: true
      }
    });

    return res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });

  } catch (error) {
    console.error('GET LOCATIONS ERROR:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to get locations',
      details: error.message
    });
  }
}

module.exports = {
  getLocations
};