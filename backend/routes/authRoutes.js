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
  getMe,
  searchUsers,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// Fayda upload folder
const faydaUploadPath = path.join(
  __dirname,
  "..",
  "uploads",
  "fayda"
);

if (!fs.existsSync(faydaUploadPath)) {
  fs.mkdirSync(faydaUploadPath, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, faydaUploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
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

// Auth
router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// Fayda
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

// Current user
router.get("/me", verifyToken, getMe);

// Search landlords
router.get("/search", verifyToken, searchUsers);

module.exports = router;