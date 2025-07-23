const mongoose = require('mongoose');

const SocialMediaSchema = new mongoose.Schema({
  type: String,   
  url: String     
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  state: String,
  course: String,
  passingYear: Number,
  registrationNumber: String,
  avatar: String,
  bio: { type: String, default: '' },
  socialMedia: [SocialMediaSchema],  // array of social media entries
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
});

module.exports = mongoose.model('User', UserSchema);
