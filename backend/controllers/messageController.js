const {
  sendMessage,
  getConversation,
  listUserMessages,
  markMessagesAsRead,
} = require('../services/messageService');


// ==========================================
// CREATE MESSAGE
// POST /api/messages
// ==========================================
async function createMessage(req, res) {
  try {
    const {
      receiverId,
      content,
      propertyId,
    } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        error: 'receiverId and content are required',
      });
    }

    const message = await sendMessage({
      senderId: req.user.userId,
      receiverId,
      content,
      propertyId: propertyId || null,
    });

    return res.status(201).json({
      success: true,
      message,
    });

  } catch (error) {
    console.error('CREATE MESSAGE ERROR:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Receiver not found',
      });
    }

    if (
      error.message ===
      'A user cannot send a message to themselves'
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    if (error.message === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    return res.status(500).json({
      error: 'Something went wrong while sending message',
      details: error.message,
    });
  }
}


// ==========================================
// GET CONVERSATION
// GET /api/messages/:contactUserId
// ==========================================
async function getMessages(req, res) {
  try {
    const { contactUserId } = req.params;
    const { propertyId } = req.query;

    if (!contactUserId) {
      return res.status(400).json({
        error: 'contactUserId is required',
      });
    }

    const conversation = await getConversation(
      req.user.userId,
      contactUserId,
      propertyId || null
    );

    await markMessagesAsRead(
      req.user.userId,
      contactUserId
    );

    return res.status(200).json({
      success: true,
      messages: conversation,
    });

  } catch (error) {
    console.error(
      'GET CONVERSATION ERROR:',
      error
    );

    return res.status(500).json({
      error: 'Something went wrong while fetching messages',
      details: error.message,
    });
  }
}


// ==========================================
// LIST ALL USER MESSAGES
// GET /api/messages
// ==========================================
async function listMessages(req, res) {
  try {
    const messages = await listUserMessages(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error(
      'LIST MESSAGES ERROR:',
      error
    );

    return res.status(500).json({
      error: 'Something went wrong while fetching messages',
      details: error.message,
    });
  }
}


module.exports = {
  createMessage,
  getMessages,
  listMessages,
}; 