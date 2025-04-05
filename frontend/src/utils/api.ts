import axios from 'axios';
import { getToken, logout } from './auth';

const API_URL = '/api';

// ai-gen start (claude sonnet 3.7, 0)
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
// ai-gen end

const api = createAxiosInstance();

// Login
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password }, {
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;