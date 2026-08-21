const express = require("express");

const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileController");

const { verifyToken } = require("../middleware/authMiddleware");

// ==========================================
// TENANT PROFILE
// ==========================================

// GET /api/profile
router.get("/", verifyToken, getMyProfile);

// PUT /api/profile
router.put("/", verifyToken, updateMyProfile);

module.exports = router;