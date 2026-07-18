import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://zeppo-backend.onrender.com'
    : 'http://localhost:3001',
});

export default API;
