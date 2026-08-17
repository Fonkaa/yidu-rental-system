const prisma = require('../prisma/client');
const { notifyUser } = require('../services/notificationService');

async function getPendingProperties(req, res) {
  try {
    const pending = await prisma.property.findMany({
      where: { status: 'PENDING' },
      include: { landlord: { select: { fullName: true, email: true } }, category: true, location: true },
    });
    res.json(pending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching pending properties' });
  }
}

async function approveProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: 'APPROVED',
        publishedAt: new Date(),
      },
    });

    await notifyUser(
      property.landlordId,
      'LISTING_APPROVED',
      'Listing Approved',
      `Your listing "${property.titleEn}" has been approved and is now live.`,
      'Property',
      property.id
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong approving the property' });
  }
}

async function rejectProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await notifyUser(
      property.landlordId,
      'LISTING_REJECTED',
      'Listing Rejected',
      `Your listing "${property.titleEn}" was rejected. Please review and resubmit.`,
      'Property',
      property.id
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong rejecting the property' });
  }
}

module.exports = { getPendingProperties, approveProperty, rejectProperty };