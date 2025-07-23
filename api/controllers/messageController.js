const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.sendMessage = async (req, res) => {
  const { chatId, text } = req.body;

  try {
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      text,
      timestamp: Date.now(),
      type: 'text'
    });

    // Update chat with last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getMessagesByChat = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name email') // ✅ Include user info
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get messages' });
  }
};
