const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { checkAndExpireListings } = require('./controllers/propertyController');
const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const propertyRoutes = require('./routes/propertyRoutes');
app.use('/api/properties', propertyRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/admin/settings', settingsRoutes);
const lookupRoutes = require('./routes/lookupRoutes');
app.use('/api/lookup', lookupRoutes);
app.get('/', (req, res) => {
  res.send('House Rental API is running');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  setInterval(checkAndExpireListings, 60 * 60 * 1000); // runs every hour
});