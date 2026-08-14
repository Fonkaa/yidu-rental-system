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
async function uploadImages(req, res) {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.landlordId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this property' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const imageRecords = await Promise.all(
      req.files.map((file) =>
        prisma.propertyImage.create({
          data: {
            url: `/uploads/${file.filename}`,
            propertyId: id,
          },
        })
      )
    );

    res.status(201).json(imageRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong uploading images' });
  }
}
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.landlordId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this property' });
    }

    const { titleEn, titleAm, descriptionEn, descriptionAm, categoryId, locationId, landmarkDescription, gpsLat, gpsLng, price } = req.body;

    const contentFieldsChanged =
      (titleEn !== undefined && titleEn !== property.titleEn) ||
      (descriptionEn !== undefined && descriptionEn !== property.descriptionEn) ||
      (categoryId !== undefined && categoryId !== property.categoryId) ||
      (locationId !== undefined && locationId !== property.locationId) ||
      (landmarkDescription !== undefined && landmarkDescription !== property.landmarkDescription) ||
      (gpsLat !== undefined && gpsLat !== property.gpsLat) ||
      (gpsLng !== undefined && gpsLng !== property.gpsLng);

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(titleEn !== undefined && { titleEn }),
        ...(titleAm !== undefined && { titleAm }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionAm !== undefined && { descriptionAm }),
        ...(categoryId !== undefined && { categoryId }),
        ...(locationId !== undefined && { locationId }),
        ...(landmarkDescription !== undefined && { landmarkDescription }),
        ...(gpsLat !== undefined && { gpsLat: parseFloat(gpsLat) }),
        ...(gpsLng !== undefined && { gpsLng: parseFloat(gpsLng) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(contentFieldsChanged && property.status === 'APPROVED' && { status: 'PENDING' }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the property' });
  }
}
module.exports = { createProperty, uploadImages, updateProperty };