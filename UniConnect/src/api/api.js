// src/api/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://172.24.107.163:5000/api',  // Adjust as needed
  withCredentials: true,
});

export default API;
