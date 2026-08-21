const express = require('express');

const router = express.Router();

const {
  createMessage,
  getMessages,
  listMessages,
} = require('../controllers/messageController');

const {
  verifyToken,
} = require('../middleware/authMiddleware');

router.use(verifyToken);

// Get all messages for logged-in user
router.get('/', listMessages);

// Get conversation with another user
router.get('/:contactUserId', getMessages);

// Send a message
router.post('/', createMessage);

module.exports = router;