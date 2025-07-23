const express = require('express');
const router = express.Router();
const auth = require('../models/middleware/authMiddleware');
const { getUserChats, getChatById } = require('../controllers/chatController');

router.get('/user', auth, getUserChats);
router.get('/:chatId', auth, getChatById);

module.exports = router;
