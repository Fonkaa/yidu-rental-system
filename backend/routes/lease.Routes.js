const express = require("express");
const router = express.Router();
const { getTenantLeases } = require("../controllers/leaseController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/leases/my-leases
router.get("/my-leases", verifyToken, getTenantLeases);

module.exports = router;