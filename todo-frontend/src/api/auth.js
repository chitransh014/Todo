import axios from "axios";

const API_URL = "http://192.168.1.13:3000/api/auth";



const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (data) =>
  api.post('/login', data).then(res => res.data);

export const signup = async (data) =>
  api.post('/register', data).then(res => res.data);
