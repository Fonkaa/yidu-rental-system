const prisma = require('../prisma/client');

<<<<<<< HEAD
// ==========================================
// CREATE NOTIFICATION
// ==========================================

async function createNotification(data) {
 const {
  userId,
  type,
  title,
  message,
  relatedEntityType,
  relatedEntityId,
} = data;

  if (!userId || !type || !title || !message) {
    throw new Error(
      'userId, type, title, and message are required'
    );
  }

  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedEntityType: relatedEntityType || null,
relatedEntityId: relatedEntityId || null,
    },
  });
}

// ==========================================
// NOTIFY USER
// Used by property/rental/message features
// ==========================================

async function notifyUser(
  userId,
  type,
  title,
  message,
  entityType = null,
  entityId = null
) {
  return await createNotification({
    userId,
    type,
    title,
    message,
    entityType,
    entityId,
  });
}

// ==========================================
// LIST NOTIFICATIONS
// ==========================================

async function listNotifications(userId, unreadOnly = false) {
  const where = {
    userId,
  };

  if (unreadOnly) {
    where.isRead = false;
  }

  return await prisma.notification.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

async function markNotificationAsRead(
  notificationId,
  userId
) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createNotification,
  notifyUser,
  listNotifications,
  markNotificationAsRead,
};
=======
async function notifyUser(userId, type, title, message, relatedEntityType = null, relatedEntityId = null) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedEntityType,
        relatedEntityId,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

module.exports = { notifyUser };
>>>>>>> origin/feature/developer-a-auth
