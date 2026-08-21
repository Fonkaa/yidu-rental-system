const {
  createNotification,
  listNotifications,
  markNotificationAsRead,
} = require('../services/notificationService');

async function createNotificationEntry(req, res) {
  try {
    const notification = await createNotification(req.body);
    return res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong while creating notification' });
  }
}

async function getNotifications(req, res) {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await listNotifications(req.user.userId, unreadOnly);
    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong while fetching notifications' });
  }
}

async function readNotification(req, res) {
  try {
    const { id } = req.params;
    const result = await markNotificationAsRead(id, req.user.userId);

    if (result.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong while marking notification as read' });
  }
}

module.exports = {
  createNotificationEntry,
  getNotifications,
  readNotification,
};
