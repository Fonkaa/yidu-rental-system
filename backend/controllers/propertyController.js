const prisma = require('../prisma/client');
async function createProperty(req, res) {
  try {
    const { titleEn, titleAm, descriptionEn, descriptionAm, price, rooms, furnished, categoryId, locationId, landmarkDescription, gpsLat, gpsLng } = req.body;

    if (!titleEn || !descriptionEn || !price || !rooms || !categoryId || !locationId) {
      return res.status(400).json({ error: 'titleEn, descriptionEn, price, rooms, categoryId, and locationId are required' });
    }

    const property = await prisma.property.create({
      data: {
        titleEn,
        titleAm,
        descriptionEn,
        descriptionAm,
        price: parseFloat(price),
        rooms: parseInt(rooms),
        furnished: furnished === true || furnished === 'true',
        categoryId,
        locationId,
        landmarkDescription,
        gpsLat: gpsLat ? parseFloat(gpsLat) : null,
        gpsLng: gpsLng ? parseFloat(gpsLng) : null,
        landlordId: req.user.userId,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong creating the property' });
  }
}
module.exports = { createProperty };