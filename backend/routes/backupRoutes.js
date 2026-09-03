const express = require("express");

const {
  createBackup,
  downloadBackup,
} = require("../controllers/backupController");

const router = express.Router();

// Create database backup
router.post("/create", createBackup);

// Download backup
router.get("/download/:filename", downloadBackup);

module.exports = router;