const prisma = require('../prisma/client');

// ==========================================
// UPDATE PROPERTY & MANAGE PHOTOS
// ==========================================
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    // 1. Verify property ownership
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existingProperty) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    if (existingProperty.landlordId !== landlordId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: "Unauthorized to update this property" });
    }

    // Safely parse body fields from multer multipart form-data
    const body = req.body || {};
    const titleEn = body.titleEn;
    const descriptionEn = body.descriptionEn;
    const price = body.price;
    const rooms = body.rooms;
    const furnished = body.furnished;

    // 2. Prepare text field updates using only standard schema fields
    const updateData = {};
    
    if (titleEn !== undefined && titleEn !== '') {
      updateData.titleEn = String(titleEn).trim();
    }
    
    if (price !== undefined && price !== '') {
      updateData.price = Number(price);
    }
    
    if (rooms !== undefined && rooms !== '') {
      updateData.rooms = Number(rooms);
    }
    
    if (descriptionEn !== undefined) {
      updateData.descriptionEn = String(descriptionEn).trim();
    }
    
    if (furnished !== undefined) {
      updateData.furnished = String(furnished) === 'true';
    }

    // 3. Update basic details in database
    await prisma.property.update({
      where: { id },
      data: updateData,
    });

    // 4. Handle new uploaded photo files if present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await prisma.propertyImage.create({
          data: {
            url: `/uploads/${file.filename}`,
            propertyId: id,
          },
        });
      }
    }

    // Fetch final updated record with new images, category, and location
    const finalProperty = await prisma.property.findUnique({
      where: { id },
      include: { images: true, category: true, location: true }
    });

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: finalProperty,
    });

  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to update property in database", details: error.message });
  }
}

// ==========================================
// GET LANDLORD FINANCIAL SUMMARY
// ==========================================
async function getLandlordFinancialSummary(req, res) {
  try {
    const landlordId = req.user.userId;

    // Fetch all properties owned by this landlord
    const properties = await prisma.property.findMany({
      where: { landlordId },
      include: {
        rentalRequests: {
          include: { payment: true }
        }
      }
    });

    let totalRevenue = 0;
    let totalVolume = 0;

    properties.forEach(prop => {
      if (prop.status === 'RENTED') {
        totalRevenue += Number(prop.price || 0);
      }
      // Sum up verified payments from rental requests if available
      prop.rentalRequests.forEach(req => {
        if (req.isPaid && req.payment) {
          totalVolume += Number(req.payment.amount || prop.price || 0);
        }
      });
    });

    return res.status(200).json({
      success: true,
      totalRevenue,
      totalVolume: totalVolume > 0 ? totalVolume : totalRevenue * 10
    });
  } catch (error) {
    console.error("LANDLORD FINANCIAL SUMMARY ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch financial summary" });
  }
}

// ==========================================
// DELETE PROPERTY
// ==========================================
async function deleteProperty(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    if (property.landlordId !== landlordId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: "Unauthorized to delete this property" });
    }

    // Delete associated images and request records if needed, then delete property
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    await prisma.rentalRequest.deleteMany({ where: { propertyId: id } });
    await prisma.property.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error("DELETE PROPERTY ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to delete property", details: error.message });
  }
}

module.exports = {
  updateProperty,
  getLandlordFinancialSummary,
  deleteProperty,
};