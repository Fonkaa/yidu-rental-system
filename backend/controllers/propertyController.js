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

    // --- REQUIRE LANDLORD TO BE ACTIVE TO SHOW PROPERTIES ---
    const where = {
      status: 'APPROVED',
      landlord: {
        isActive: true,
      },
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
// CREATE PROPERTY (Supports videoUrl upload)
// ==========================================
async function createProperty(req, res) {
  try {
    const { titleEn, titleAm, descriptionEn, descriptionAm, price, rooms, furnished, categoryId, locationId, landmarkDescription, gpsLat, gpsLng } = req.body;

    if ((!titleEn && !titleAm) || (!descriptionEn && !descriptionAm) || !price || !rooms || !categoryId || !locationId) {
      return res.status(400).json({ error: 'title (English or Amharic), description (English or Amharic), price, rooms, categoryId, and locationId are required' });
    }

    const landlord = await executeWithRetry(() => prisma.user.findUnique({ where: { id: req.user.userId } }));
    
    // --- RESTRICT DEACTIVATED USERS FROM CREATING LISTINGS ---
    if (!landlord || !landlord.isActive) {
      return res.status(403).json({ error: 'Your account is currently deactivated. You cannot create or modify property listings.', code: 'ACCOUNT_DEACTIVATED' });
    }

    if (!landlord.faydaNumber) {
      return res.status(403).json({ error: 'You must add your ID number to your profile before creating a listing.', code: 'ID_REQUIRED' });
    }

    // --- CHECK FOR VIDEO FILE UPLOAD ---
    let videoUrl = null;
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        videoUrl = `/uploads/${req.files.video[0].filename}`;
      } else if (req.files['video'] && req.files['video'][0]) {
        videoUrl = `/uploads/${req.files['video'][0].filename}`;
      }
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
          videoUrl, // Save video tour path if uploaded
          landlordId: req.user.userId,
          status: 'PENDING',
        },
      })
    );

    // --- NOTIFY ALL ADMINS ABOUT NEW PENDING LISTING ---
    try {
      const admins = await executeWithRetry(() =>
        prisma.user.findMany({
          where: { role: 'ADMIN', isActive: true },
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
// UPLOAD IMAGES & VIDEOS
// ==========================================
async function uploadImages(req, res) {
  try {
    const { id } = req.params;

    const property = await executeWithRetry(() => prisma.property.findUnique({ 
      where: { id },
      include: { landlord: true }
    }));

    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ error: 'Property not found or owner account is inactive' });
    }
    if (property.landlordId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this property' });
    }

    // Check if video file or image files are attached
    const files = req.files || [];
    const videoFile = req.file || (files.video ? files.video[0] : null) || (files['video'] ? files['video'][0] : null);
    const imageFiles = files.images || files['images'] || (Array.isArray(files) ? files.filter(f => f.fieldname === 'images') : []);

    let videoUpdateResult = null;
    if (videoFile) {
      const videoUrl = `/uploads/${videoFile.filename}`;
      videoUpdateResult = await executeWithRetry(() =>
        prisma.property.update({
          where: { id },
          data: { videoUrl }
        })
      );
    }

    if (!imageFiles.length && !videoFile) {
      return res.status(400).json({ error: 'At least one image or video is required' });
    }

    let imageRecords = [];
    if (imageFiles.length > 0) {
      imageRecords = await executeWithRetry(() =>
        Promise.all(
          imageFiles.map((file) =>
            prisma.propertyImage.create({
              data: {
                url: `/uploads/${file.filename}`,
                propertyId: id,
              },
            })
          )
        )
      );
    }

    res.status(201).json({ success: true, imageRecords, property: videoUpdateResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong uploading media', details: error.message });
  }
}

// ==========================================
// UPDATE PROPERTY & MANAGE MEDIA / PHOTOS
// ==========================================
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    const existingProperty = await executeWithRetry(() =>
      prisma.property.findUnique({
        where: { id },
        include: { images: true, landlord: true }
      })
    );

    if (!existingProperty || !existingProperty.landlord?.isActive) {
      return res.status(404).json({ success: false, error: "Property not found or owner account is inactive" });
    }

    if (existingProperty.landlordId !== landlordId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

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

    // Handle video upload if provided in update request
    if (req.files) {
      const vFile = req.files.video ? req.files.video[0] : (req.files['video'] ? req.files['video'][0] : null);
      if (vFile) {
        updateData.videoUrl = `/uploads/${vFile.filename}`;
      }
    }

    await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: updateData,
      })
    );

    // Handle additional image uploads
    const imgFiles = req.files?.images || req.files?.['images'] || (Array.isArray(req.files) ? req.files.filter(f => f.fieldname === 'images') : []);
    if (imgFiles && imgFiles.length > 0) {
      for (const file of imgFiles) {
        const fileUrl = `/uploads/${file.filename}`;
        try {
          await executeWithRetry(() =>
            prisma.propertyImage.create({
              data: {
                url: fileUrl,
                propertyId: id,
              },
            })
          );
        } catch (imgErr) {
          console.error(`FAILED to save image record ${fileUrl}:`, imgErr.message);
          throw imgErr;
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
      message: "Property and media updated successfully",
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

    const property = await executeWithRetry(() => prisma.property.findUnique({ 
      where: { id },
      include: { landlord: true }
    }));

    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ error: 'Property not found or owner account is inactive' });
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
    const property = await executeWithRetry(() => prisma.property.findUnique({ 
      where: { id },
      include: { landlord: true }
    }));

    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ error: 'Property not found or owner account is inactive' });
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
async function rejectProperty(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const property = await executeWithRetry(() => prisma.property.findUnique({ 
      where: { id },
      include: { landlord: true }
    }));

    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ error: 'Property not found or owner account is inactive' });
    }

    const finalReason = (reason && reason.trim() !== "") 
      ? reason.trim() 
      : "Listing did not meet platform guidelines.";

    const updated = await executeWithRetry(() =>
      prisma.property.update({
        where: { id },
        data: { 
          status: 'REJECTED',
          rejectionReason: finalReason 
        },
      })
    );

    res.json({ message: "Property rejected successfully", property: updated });
  } catch (error) {
    console.error("Reject property error:", error);
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
        landlord: { isActive: true }
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
    const property = await executeWithRetry(() => prisma.property.findUnique({ 
      where: { id },
      include: { landlord: true }
    }));

    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ error: 'Property not found or owner account is inactive' });
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
          landlord: { select: { id: true, fullName: true, email: true, phone: true, isActive: true } },
        },
      })
    );

    // --- HIDE PROPERTY DETAILS IF PROPERTY DOES NOT EXIST OR LANDLORD IS DEACTIVATED ---
    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return res.status(200).json({ success: true, property });
  } catch (error) {
    console.error('GET PROPERTY BY ID ERROR:', error);
    return res.status(500).json({ error: 'Something went wrong fetching property details', details: error.message });
  }
}

// ==========================================
// GET LANDLORD FINANCIAL SUMMARY
// ==========================================
async function getLandlordFinancialSummary(req, res) {
  try {
    const landlordId = req.user.userId;

    const properties = await executeWithRetry(() =>
      prisma.property.findMany({
        where: { landlordId },
        include: {
          rentalRequests: {
            include: { payment: true }
          }
        }
      })
    );

    let totalRevenue = 0;
    let totalVolume = 0;

    properties.forEach(prop => {
      if (prop.status === 'RENTED') {
        totalRevenue += Number(prop.price || 0);
      }
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

    const property = await executeWithRetry(() => prisma.property.findUnique({ 
      where: { id },
      include: { landlord: true }
    }));
    
    if (!property || !property.landlord?.isActive) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    if (property.landlordId !== landlordId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: "Unauthorized to delete this property" });
    }

    await executeWithRetry(() =>
      Promise.all([
        prisma.propertyImage.deleteMany({ where: { propertyId: id } }),
        prisma.rentalRequest.deleteMany({ where: { propertyId: id } }),
        prisma.property.delete({ where: { id } })
      ])
    );

    return res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error("DELETE PROPERTY ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to delete property", details: error.message });
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
  getMyProperties,
  getLandlordFinancialSummary,
  deleteProperty
};