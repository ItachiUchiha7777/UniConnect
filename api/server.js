require('dotenv').config(); // Load env vars early

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const feedRoutes = require('./routes/feedRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS settings
app.use(cors({
  origin: true, 
  credentials: true,
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feed', feedRoutes);

// Basic test route
app.get('/', (req, res) => res.send('UniConnect API running'));

// Create HTTP server and bind Socket.IO
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3000',
  'https://uni-connect-one.vercel.app'
];
const io = new socketio.Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Import your Message and Chat models
const Message = require('./models/Message');
const Chat = require('./models/Chat');

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Handle sendMessage event
  socket.on('sendMessage', async (data) => {
    try {
      // data: { chatId, text, senderId }

      const newMessage = await Message.create({
        chatId: data.chatId,
        senderId: data.senderId,
        text: data.text,
        timestamp: Date.now(),
        type: 'text',
      });

      // Update last message on chat
      await Chat.findByIdAndUpdate(data.chatId, { lastMessage: newMessage._id });

      // Populate sender info before emitting
      const populatedMessage = await newMessage.populate('senderId', 'name avatar');

      // Emit message to all sockets in the room
      io.to(data.chatId).emit('messageReceived', populatedMessage);
    } catch (error) {
      console.error('Socket sendMessage error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
