const prisma = require('../prisma/client');

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