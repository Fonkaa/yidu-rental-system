const prisma = require('../prisma/client');
const { notifyUser } = require('../services/notificationService');

// ==========================================
// DATABASE CONNECTION RETRY HELPER
// ==========================================
async function executeWithRetry(operation, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.code === 'P1001' || 
        error.message?.includes("Can't reach database server") ||
        error.message?.includes("PrismaClientInitializationError");

      if (isConnectionError && i < retries - 1) {
        console.warn(`Database connection lost. Retrying attempt ${i + 2} in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

// ==========================================
// GET PROPERTIES (Search, Filter, Pagination)
// ==========================================
async function getProperties(req, res) {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      rooms,
      furnished,
      categoryId,
      locationId,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: 'APPROVED',
    };

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleAm: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { landmarkDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    if (rooms) {
      where.rooms = { gte: parseInt(rooms) };
    }

    if (furnished !== undefined && furnished !== '') {
      where.furnished = furnished === 'true' || furnished === true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [properties, totalProperties] = await executeWithRetry(() =>
      Promise.all([
        prisma.property.findMany({
          where,
          include: {
            category: true,
            location: true,
            images: true,
            landlord: { select: { fullName: true, email: true, phone: true } },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.property.count({ where }),
      ])
    );

    return res.status(200).json({
      success: true,
      properties,
      totalProperties,
      totalPages: Math.ceil(totalProperties / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('GET PROPERTIES ERROR:', error);
    return res.status(500).json({ error: 'Something went wrong fetching properties', details: error.message });
  }
}

// ==========================================
// CREATE PROPERTY
// ==========================================
async function createProperty(req, res) {
  try {
    const { titleEn, titleAm, descriptionEn, descriptionAm, price, rooms, furnished, categoryId, locationId, landmarkDescription, gpsLat, gpsLng } = req.body;

    if ((!titleEn && !titleAm) || (!descriptionEn && !descriptionAm) || !price || !rooms || !categoryId || !locationId) {
      return res.status(400).json({ error: 'title (English or Amharic), description (English or Amharic), price, rooms, categoryId, and locationId are required' });
    }

    const landlord = await executeWithRetry(() => prisma.user.findUnique({ where: { id: req.user.userId } }));
    if (!landlord.faydaNumber) {
      return res.status(403).json({ error: 'You must add your ID number to your profile before creating a listing.', code: 'ID_REQUIRED' });
    }

    const property = await executeWithRetry(() =>
      prisma.property.create({
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
          status: 'PENDING',
        },
      })
    );

    // --- NOTIFY ALL ADMINS ABOUT NEW PENDING LISTING ---
    try {
      const admins = await executeWithRetry(() =>
        prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true }
        })
      );

      for (const admin of admins) {
        await notifyUser(
          admin.id,
          'NEW_LISTING_PENDING',
          'New Property Awaiting Review 📋',
          `${landlord.fullName} submitted a new listing "${property.titleEn || 'Property'}" for moderation.`,
          'Property',
          property.id
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify admins about new property:", notifErr);
    }

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong creating the property', details: error.message });
  }
}

// ==========================================
// UPLOAD IMAGES
// ==========================================
async function uploadImages(req, res) {
  try {
    const { id } = req.params;

    const property = await executeWithRetry(() => prisma.property.findUnique({ where: { id } }));
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.landlordId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this property' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const imageRecords = await executeWithRetry(() =>
      Promise.all(
        req.files.map((file) =>
          prisma.propertyImage.create({
            data: {
              url: `/uploads/${file.filename}`,
              propertyId: id,
            },
          })
        )
      )
    );

    res.status(201).json(imageRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong uploading images', details: error.message });
  }
}

// ==========================================
// UPDATE PROPERTY & MANAGE PHOTOS (WITH RETRY)
// ==========================================
// ==========================================
// UPDATE PROPERTY & MANAGE PHOTOS (FINAL FIXED)
// ==========================================
// ==========================================
// UPDATE PROPERTY & MANAGE PHOTOS (ROBUST FIXED)
// ==========================================
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    const existingProperty = await executeWithRetry(() =>
      prisma.property.findUnique({
        where: { id },
        include: { images: true }
      })
    );

    if (!existingProperty) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    if (existingProperty.landlordId !== landlordId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Safely extract from req.body (populated by multer)
    const { titleEn, titleAm, descriptionEn, descriptionAm, price, rooms, furnished } = req.body || {};

    const updateData = {};
    
    if (titleEn !== undefined && titleEn !== '') updateData.titleEn = String(titleEn).trim();
    if (titleAm !== undefined && titleAm !== '') updateData.titleAm = String(titleAm).trim();
    if (descriptionEn !== undefined) updateData.descriptionEn = String(descriptionEn).trim();
    if (descriptionAm !== undefined) updateData.descriptionAm = String(descriptionAm).trim();
    
    if (price !== undefined && price !== '' && !isNaN(price)) {
      updateData.price = parseFloat(price);
    }
    if (rooms !== undefined && rooms !== '' && !isNaN(rooms)) {
      updateData.rooms = parseInt(rooms, 10);
    }
    
    if (furnished !== undefined) {
      updateData.furnished = furnished === true || furnished === 'true' || furnished === 'on';
    }

    // 1. Execute property details update
    await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: updateData,
      })
    );

    // 2. Handle new uploaded photo files with explicit logging
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded files for property ID: ${id}`);
      
      for (const file of req.files) {
        const fileUrl = `/uploads/${file.filename}`;
        
        try {
          await executeWithRetry(() =>
            prisma.propertyImage.create({
              data: {
                url: fileUrl, // NOTE: If your Prisma schema uses 'imageUrl' instead of 'url', change 'url' to 'imageUrl' here!
                propertyId: id,
              },
            })
          );
          console.log(`Successfully saved image record: ${fileUrl}`);
        } catch (imgErr) {
          console.error(`FAILED to save image record ${fileUrl}:`, imgErr.message);
          throw imgErr; // Bubble up so the client knows why it failed
        }
      }
    }

    const finalProperty = await executeWithRetry(() =>
      prisma.property.findUnique({
        where: { id },
        include: { images: true, category: true, location: true }
      })
    );

    return res.status(200).json({
      success: true,
      message: "Property and photos updated successfully",
      property: finalProperty,
    });

  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to update property in database", details: error.message });
  }
}

// ==========================================
// UPDATE PROPERTY STATUS (RENTED / UNAVAILABLE)
// ==========================================
async function updatePropertyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['UNAVAILABLE', 'RENTED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'status must be UNAVAILABLE or RENTED' });
    }

    const property = await executeWithRetry(() => prisma.property.findUnique({ where: { id } }));
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.landlordId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this property' });
    }

    const updated = await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: { status },
      })
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the status', details: error.message });
  }
}

// ==========================================
// APPROVE PROPERTY (ADMIN)
// ==========================================
async function approveProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await executeWithRetry(() => prisma.property.findUnique({ where: { id } }));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: {
          status: 'APPROVED',
          publishedAt: new Date(),
        },
      })
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong approving the property', details: error.message });
  }
}

// ==========================================
// REJECT PROPERTY (ADMIN)
// ==========================================
exports.rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if reason exists and is not just whitespace
    const finalReason = (reason && reason.trim() !== "") 
      ? reason.trim() 
      : "Listing did not meet platform guidelines.";

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { 
        status: "REJECTED",
        rejectionReason: finalReason 
      },
    });

    res.json({ message: "Property rejected successfully", property: updatedProperty });
  } catch (err) {
    console.error("Reject property error:", err);
    res.status(500).json({ error: "Failed to reject property." });
  }
};
async function rejectProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await executeWithRetry(() => prisma.property.findUnique({ where: { id } }));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: { status: 'REJECTED' },
      })
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong rejecting the property', details: error.message });
  }
}

// ==========================================
// CHECK AND EXPIRE LISTINGS
// ==========================================
async function checkAndExpireListings() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await executeWithRetry(() =>
    prisma.property.updateMany({
      where: {
        status: 'APPROVED',
        publishedAt: { lte: thirtyDaysAgo },
      },
      data: { status: 'EXPIRED' },
    })
  );
}

// ==========================================
// RENEW EXPIRED PROPERTY
// ==========================================
async function renewProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await executeWithRetry(() => prisma.property.findUnique({ where: { id } }));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.landlordId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this property' });
    }
    if (property.status !== 'EXPIRED') {
      return res.status(400).json({ error: 'Only expired listings can be renewed' });
    }

    const renewed = await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: {
          status: 'PENDING',
          publishedAt: null,
        },
      })
    );

    res.json(renewed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong renewing the property', details: error.message });
  }
}

// ==========================================
// GET LANDLORD'S PROPERTIES
// ==========================================
async function getMyProperties(req, res) {
  try {
    const properties = await executeWithRetry(() =>
      prisma.property.findMany({
        where: { landlordId: req.user.userId },
        include: { category: true, location: true, images: true },
        orderBy: { createdAt: 'desc' },
      })
    );
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching your properties', details: error.message });
  }
}

// ==========================================
// GET PROPERTY BY ID
// ==========================================
async function getPropertyById(req, res) {
  try {
    const { id } = req.params;
    const property = await executeWithRetry(() =>
      prisma.property.findUnique({
        where: { id },
        include: {
          category: true,
          location: true,
          images: true,
          landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      })
    );

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return res.status(200).json({ success: true, property });
  } catch (error) {
    console.error('GET PROPERTY BY ID ERROR:', error);
    return res.status(500).json({ error: 'Something went wrong fetching property details', details: error.message });
  }
}

module.exports = { 
  getProperties,
  createProperty, 
  uploadImages, 
  getPropertyById,
  updateProperty, 
  updatePropertyStatus, 
  approveProperty, 
  rejectProperty, 
  checkAndExpireListings, 
  renewProperty, 
  getMyProperties
};