const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['global', 'course', 'batch', 'state'] },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
});

module.exports = mongoose.model('Chat', ChatSchema);
