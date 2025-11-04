import axios from "axios";

const BASE_URL = "https://todo-backend-83q7.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL + "/auth",
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (data) =>
  api.post('/login', data).then(res => res.data);

export const signup = async (data) =>
  api.post('/register', data).then(res => res.data);

export { BASE_URL };
