import axios from "axios";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth`;




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
