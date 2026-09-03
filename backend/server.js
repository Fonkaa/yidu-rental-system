const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { checkAndExpireListings } = require('./controllers/propertyController');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);

// ==========================================
// OPENAI SETUP
// ==========================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-GWtggmEEVZdAnsMyscE9JJb8vwFLvSAFKwEJBK2nBItshcDM",
});

// ==========================================
// SOCKET.IO SETUP
// ==========================================
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.set('io', io);

io.on("connection", (socket) => {
  socket.on("join_room", (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  socket.on("send_message", (messageData) => {
    if (messageData && messageData.receiverId) {
      io.to(messageData.receiverId).emit("receive_message", messageData);
    }
  });

  socket.on("disconnect", () => {});
});

// ==========================================
// MIDDLEWARE
// ==========================================
const compression = require('compression');
app.use(compression());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json());

// ==========================================
// ROUTE IMPORTS & REGISTRATION
// ==========================================
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 2. Property & Landlord Routes
const propertyRoutes = require('./routes/propertyRoutes');
app.use('/api/properties', propertyRoutes);
app.use('/api/landlord', propertyRoutes); // <-- Catches /api/landlord/financial-summary

// 3. Rental Requests Routes
const rentalRequestRoutes = require('./routes/rentalRequest.Routes');
app.use('/api/rental-requests', rentalRequestRoutes);

// 4. Favorites Routes
const favoriteRoutes = require('./routes/favoriteRoutes');
app.use('/api/favorites', favoriteRoutes);

// 5. Admin Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
const backupRoutes = require("./routes/backupRoutes");
app.use("/api/admin/backup", backupRoutes);

// 7. Lookup Routes
const lookupRoutes = require('./routes/lookupRoutes');
app.use('/api/lookup', lookupRoutes);

// 8. Payment Routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// 9. Dashboard Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// 10. Lease Routes
const leaseRoutes = require('./routes/lease.Routes');
app.use('/api/leases', leaseRoutes);

// 11. Message Routes
const messageRoutes = require('./routes/message.Routes');
app.use('/api/messages', messageRoutes);

// 12. User Routes
const userRoutes = require('./routes/authRoutes');
app.use('/api/users', userRoutes);

const notificationRoutes = require('./routes/notification.Routes');
app.use('/api/notifications', notificationRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// ==========================================
// AI ASSISTANT ENDPOINT
// ==========================================
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are Yidu Smart Assistant, a helpful assistant for a real estate and house rental platform." 
        },
        { role: "user", content: prompt }
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

// ==========================================
// STATIC FILES & DOCUMENTATION
// ==========================================
app.use('/uploads', express.static('uploads'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.send('House Rental API is running with Socket.io');
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} with Socket.io enabled`);
  setInterval(checkAndExpireListings, 60 * 60 * 1000);
})