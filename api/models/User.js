const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  state: String,
  course: String,
  passingYear: Number,
  registrationNumber: String,
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }]
});

module.exports = mongoose.model('User', UserSchema);
