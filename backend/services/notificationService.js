const prisma = require('../prisma/client');

async function notifyUser(userId, type, title, message, relatedEntityType, relatedEntityId) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || 'INFO',
        title,
        message,
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
      },
    });
    return notification;
  } catch (error) {
    console.error("NOTIFICATION SERVICE ERROR:", error);
  }
}

module.exports = { notifyUser };