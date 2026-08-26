const prisma = require("../prisma/client");
const { notifyUser } = require("../services/notificationService");

// GET ALL MESSAGES / CONVERSATIONS FOR LOGGED-IN USER
async function getMessages(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        receiver: { select: { id: true, fullName: true, email: true } },
        property: { select: { id: true, titleEn: true, titleAm: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({ success: true, messages, currentUserId: userId });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
}

// GET MESSAGES WITH A SPECIFIC CONTACT
async function getConversation(req, res) {
  try {
    const userId = req.user?.userId;
    const { contactId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        receiver: { select: { id: true, fullName: true, email: true } },
        property: { select: { id: true, titleEn: true, titleAm: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const contact = await prisma.user.findUnique({
      where: { id: contactId },
      select: { id: true, fullName: true, email: true }
    });

    return res.status(200).json({ success: true, messages, contact, currentUserId: userId });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to load conversation" });
  }
}

// SEND A NEW MESSAGE
async function sendMessage(req, res) {
  try {
    const senderId = req.user?.userId;
    const { receiverId, content, text, propertyId } = req.body;
    const messageText = text || content; // support both or fallback

    if (!senderId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    if (!receiverId || !messageText) {
      return res.status(400).json({ success: false, error: "Receiver and message text are required" });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text: messageText,
        propertyId: propertyId || null,
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        receiver: { select: { id: true, fullName: true, email: true } },
        property: { select: { id: true, titleEn: true, titleAm: true } }
      }
    });

    // --- TRIGGER NOTIFICATION FOR MESSAGE RECIPIENT ---
    try {
      const senderName = message.sender?.fullName || "Someone";
      const snippet = messageText.length > 40 ? `${messageText.substring(0, 40)}...` : messageText;

      await notifyUser(
        receiverId,
        'NEW_MESSAGE',
        `New Message from ${senderName} 💬`,
        snippet,
        'User',
        senderId,
        req
      );
    } catch (notifErr) {
      console.error("Failed to dispatch message notification:", notifErr);
    }

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to send message" });
  }
}

module.exports = {
  getMessages,
  getConversation,
  sendMessage,
};