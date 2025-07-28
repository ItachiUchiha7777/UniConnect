import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});
// console.log('API Base URL:', API.defaults.baseURL);

export default API;
