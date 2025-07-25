// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false, // connect manually in ChatRoom
});

export default socket;
