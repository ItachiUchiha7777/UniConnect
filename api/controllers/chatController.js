const Chat = require('../models/Chat');

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id }) 
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getChatById = async (req, res) => {
  const chat = await Chat.findById(req.params.chatId).populate('participants', 'name email');
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat);
};
