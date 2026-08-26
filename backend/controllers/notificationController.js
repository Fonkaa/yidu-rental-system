const prisma = require("../prisma/client");

// GET NOTIFICATIONS FOR LOGGED-IN USER
async function getMyNotifications(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
}

// MARK NOTIFICATION AS READ
async function markAsRead(req, res) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    }

    const notification = await prisma.notification.update({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() }
    });

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to update notification" });
  }
}

// HELPER: CREATE & BROADCAST NOTIFICATION VIA SOCKET.IO
async function sendNotification(ioOrReq, { userId, title, message, type, relatedEntityType, relatedEntityId }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'INFO',
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
      }
    });

    // Resolve socket.io instance whether passed directly or via Express req object
    let ioInstance = ioOrReq;
    if (ioOrReq && ioOrReq.app && typeof ioOrReq.app.get === 'function') {
      ioInstance = ioOrReq.app.get('io');
    }

    // Real-time delivery via Socket.io to the user's specific room
    if (ioInstance && typeof ioInstance.to === 'function') {
      ioInstance.to(userId).emit("receive_notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  sendNotification,
};