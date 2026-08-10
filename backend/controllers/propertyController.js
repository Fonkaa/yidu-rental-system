const prisma = require('../prisma/client');

async function createProperty(req, res) {
  try {
    const { title, description, price, category, rooms, furnished, location } = req.body;

    if (!title || !description || !price || !category || !rooms || !location) {
      return res.status(400).json({ error: 'title, description, price, category, rooms, and location are required' });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        rooms: parseInt(rooms),
        furnished: furnished === true || furnished === 'true',
        location,
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