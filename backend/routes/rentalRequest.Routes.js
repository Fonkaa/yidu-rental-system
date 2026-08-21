const express = require("express");

const router = express.Router();

const {
  createRequest,
  listRequests,
  updateRequestStatus,
} = require("../controllers/rentalRequestController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

// All rental request routes require login
router.use(verifyToken);

// GET    /api/rental-requests
router.get("/", listRequests);

// POST   /api/rental-requests
router.post("/", createRequest);

// PATCH  /api/rental-requests/:id/status
router.patch("/:id/status", updateRequestStatus);

module.exports = router;