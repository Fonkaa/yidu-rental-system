const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getBackups,
  createBackup,
  downloadBackup,
  deleteBackup,
  restoreBackup,
} = require("../controllers/backupController");

const {
  verifyToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// TEMPORARY RESTORE UPLOAD DIRECTORY
// =====================================================

const tempRestoreDir = path.join(
  __dirname,
  "..",
  "temp-restores"
);

if (!fs.existsSync(tempRestoreDir)) {
  fs.mkdirSync(tempRestoreDir, {
    recursive: true,
  });
}

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  dest: tempRestoreDir,

  limits: {
    fileSize: 500 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    // Current restore controller uses AdmZip,
    // so only ZIP files should be uploaded.
    if (extension === ".zip") {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only .zip backup files are allowed"
        )
      );
    }
  },
});

// =====================================================
// BACKUP ROUTES
// ALL ROUTES REQUIRE ADMIN
// =====================================================

// Get all backups
router.get(
  "/",
  verifyToken,
  requireAdmin,
  getBackups
);

// Create backup
router.post(
  "/",
  verifyToken,
  requireAdmin,
  createBackup
);

// Download backup
router.get(
  "/download/:filename",
  verifyToken,
  requireAdmin,
  downloadBackup
);

// Delete backup
router.delete(
  "/:filename",
  verifyToken,
  requireAdmin,
  deleteBackup
);

// Restore backup
router.post(
  "/restore",
  verifyToken,
  requireAdmin,
  upload.single("backup"),
  restoreBackup
);

module.exports = router;