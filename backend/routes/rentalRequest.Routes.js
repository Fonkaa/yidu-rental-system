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

// GET    /api/rental-requests (Requires login to view your requests)
router.get("/", verifyToken, listRequests);

// POST   /api/rental-requests (Requires login — logged-in tenants only)
router.post("/", verifyToken, createRequest);

// PATCH  /api/rental-requests/:id/status (Requires login to approve/reject)
router.patch("/:id/status", verifyToken, updateRequestStatus);

module.exports = router;