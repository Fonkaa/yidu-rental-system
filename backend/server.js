const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const propertyRoutes = require('./routes/propertyRoutes');
app.use('/api/properties', propertyRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('House Rental API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
