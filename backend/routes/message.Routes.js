const express = require("express");
const router = express.Router();
const { getMessages, getConversation, sendMessage } = require("../controllers/messageController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getMessages);
router.get("/:contactId", verifyToken, getConversation);
router.post("/", verifyToken, sendMessage);

module.exports = router;
module.exports = router;