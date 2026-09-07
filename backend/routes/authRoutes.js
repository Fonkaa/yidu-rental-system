const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateIdNumber,
  verifyFayda,
  getMe,
  searchUsers,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// ======================================================
// Fayda upload folder
// ======================================================

const faydaUploadPath = path.join(
  __dirname,
  "..",
  "uploads",
  "fayda"
);

if (!fs.existsSync(faydaUploadPath)) {
  fs.mkdirSync(faydaUploadPath, {
    recursive: true,
  });
}

// ======================================================
// Multer configuration
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, faydaUploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG, and WEBP images are allowed."
        )
      );
    }
  },
});

// ======================================================
// Authentication routes
// ======================================================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// ======================================================
// Fayda ID
// ======================================================

// Update Fayda ID number + front/back images
router.patch(
  "/id-number",
  verifyToken,
  upload.fields([
    {
      name: "faydaFrontImage",
      maxCount: 1,
    },
    {
      name: "faydaBackImage",
      maxCount: 1,
    },
  ]),
  updateIdNumber
);

// Separate Fayda verification route
router.post(
  "/verify-fayda",
  verifyToken,
  upload.fields([
    {
      name: "faydaFrontImage",
      maxCount: 1,
    },
    {
      name: "faydaBackImage",
      maxCount: 1,
    },
  ]),
  verifyFayda
);

// ======================================================
// Current user
// ======================================================

// Get logged-in user
router.get(
  "/me",
  verifyToken,
  getMe
);

// ======================================================
// Search users / landlords
// ======================================================

router.get(
  "/search",
  verifyToken,
  searchUsers
);

// ======================================================
// Export
// ======================================================

module.exports = router;