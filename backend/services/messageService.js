const prisma = require('../prisma/client');

// ==========================================
// SEND MESSAGE
// ==========================================
async function sendMessage({
  senderId,
  receiverId,
  content,
  propertyId = null,
}) {
  if (!senderId || !receiverId || !content || !content.trim()) {
    throw new Error('senderId, receiverId, and content are required');
  }

  if (senderId === receiverId) {
    throw new Error('A user cannot send a message to themselves');
  }

  // Check receiver
  const receiver = await prisma.user.findUnique({
    where: {
      id: receiverId,
    },
  });

  if (!receiver) {
    throw new Error('USER_NOT_FOUND');
  }

  // Property is OPTIONAL for Developer B
  // Only check it if propertyId was provided.
  if (propertyId) {
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });

    if (!property) {
      throw new Error('PROPERTY_NOT_FOUND');
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content: content.trim(),
      propertyId: propertyId || null,
    },

    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      property: true,
    },
  });

  return message;
}


// ==========================================
// GET CONVERSATION
// ==========================================
async function getConversation(
  userId,
  contactUserId,
  propertyId = null
) {
  const where = {
    OR: [
      {
        senderId: userId,
        receiverId: contactUserId,
      },
      {
        senderId: contactUserId,
        receiverId: userId,
      },
    ],
  };

  // Property is optional
  if (propertyId) {
    where.propertyId = propertyId;
  }

  return prisma.message.findMany({
    where,

    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      property: true,
    },

    orderBy: {
      createdAt: 'asc',
    },
  });
}


// ==========================================
// LIST ALL USER MESSAGES
// ==========================================
async function listUserMessages(userId) {
  return prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: userId,
        },
        {
          receiverId: userId,
        },
      ],
    },

    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      property: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}


// ==========================================
// MARK MESSAGES AS READ
// ==========================================
async function markMessagesAsRead(
  userId,
  contactUserId
) {
  return prisma.message.updateMany({
    where: {
      senderId: contactUserId,
      receiverId: userId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}


module.exports = {
  sendMessage,
  getConversation,
  listUserMessages,
  markMessagesAsRead,
};