const User = require('../models/User');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /search
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [
        { name: regex },
        { registrationNumber: regex }
      ]
    })
      .select('name avatar registrationNumber bio _id')
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {
  const { bio, socialMedia, name, phone, state } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (state) user.state = state;
    if (typeof bio !== 'undefined') user.bio = bio;
    if (Array.isArray(socialMedia)) user.socialMedia = socialMedia;

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /avatar
exports.uploadAvatar = async (req, res) => {
  try {
    req.user.avatar = req.file.path;
    await req.user.save();
    res.json({ avatar: req.user.avatar, message: 'Avatar updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Avatar upload failed' });
  }
};

// GET /:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
