const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const assignToDefaultChats = require('../utils/assignToDefaultChats');

exports.registerUser = async (req, res) => {
  const { name, email, phone, password, state, course, passingYear, registrationNumber } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const hashedPwd = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPwd,
      state,
      course,
      passingYear,
      registrationNumber
    });

    await assignToDefaultChats(newUser);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // ✅ Include user info for frontend to store
    res.status(201).json({
      message: 'Registered successfully',
      userId: newUser._id,
      name: newUser.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  
  res.json({
    message: 'Logged in successfully',
    userId: user._id,
    name: user.name
  });
};


exports.logoutUser = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
};

