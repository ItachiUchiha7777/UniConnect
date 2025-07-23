const express = require('express');
const router = express.Router();
const auth = require('../models/middleware/authMiddleware');
const {
  sendMessage,
  getMessagesByChat
} = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/:chatId', auth, getMessagesByChat);

module.exports = router;
