
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://10.221.241.163:5000/api',  
  withCredentials: true,
});

export default API;
