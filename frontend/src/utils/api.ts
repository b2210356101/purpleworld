import axios from 'axios';
import { getToken, logout } from './auth';

const API_URL = 'purpleworld-production.up.railway.app';

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

// Courier
export const registerCourier = async (formData: {
  first_Name: string;
  last_Name: string;
  ssn: string;
  email: string;
  phone_Number: string;
  password: string;
}) => {
  const response = await api.post('/auth/register/courier', formData);
  return response.data;
};

// Customer
export const registerCustomer = async (formData: {
  first_Name: string;
  last_Name: string;
  phone_Number: string;
  email: string;
  password: string;
}) => {
  const response = await api.post('/auth/register/customer', formData);
  return response.data;
};

// Restaurant
export const registerRestaurant = async (formData: {
  name: string;
  email: string;
  password: string;
  manager_Name: string;
  manager_Last_Name: string;
  phone_Number: string;
  address: string;
  tax_Id: string;
  latitude: number;
  longitude: number;
  profile_image?: string;
  buildingNumber: string;
  apartmentNumber: string;
}) => {
  const dataToSend = {
    ...formData,
    profile_image: formData.profile_image || '',
  };
  const response = await api.post('/auth/register/restaurant', dataToSend);
  return response.data;
};

export default api;
