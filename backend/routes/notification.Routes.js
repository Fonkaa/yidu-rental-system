const express = require('express');
const router = express.Router();
const { createNotificationEntry, getNotifications, readNotification } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', getNotifications);
router.post('/', createNotificationEntry);
router.patch('/:id/read', readNotification);

module.exports = router;
