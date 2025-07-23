const Chat = require('../models/Chat');

exports.getUserChats = async (req, res) => {
  const chats = await Chat.find({ _id: { $in: req.user.chats } });
  res.json(chats);
};

exports.getChatById = async (req, res) => {
  const chat = await Chat.findById(req.params.chatId).populate('participants', 'name email');
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat);
};
