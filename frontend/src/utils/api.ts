import axios from 'axios';
import { getToken, logout } from './auth';
import { Address, CurrentAddress } from '../types';

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

// Address Methods
// Get customer addresses from the API
export const getCustomerAddresses = async () => {
    try {
        const response = await api.get('/customer/addresses');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveAddress = async (address: Omit<Address, 'id'>, location: { lat: number, lng: number } | null): Promise<Address> => {
    try {
        // Check if location exists
        if (!location) {
            throw new Error('Please select a location on the map');
        }

        const requestData = {
            name: address.name || "",
            buildingNumber: address.buildingNumber,
            apartmentNumber: address.apartmentNumber,
            fullAddress: address.fullAddress,
            floor: address.floor,
            phoneNumber: address.phoneNumber,
            deliveryNote: address.deliveryNote || "",
            latitude: location?.lat || address.latitude,
            longitude: location?.lng || address.longitude
        };

        // Make the API call
        const response = await api.post('/customer/address', requestData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const setCurrentAddress = async (addressId: number) => {
    try {
        const response = await fetch(`${API_URL}/customer/set-current-address?addressId=${addressId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Failed to set address: ${response.status} ${response.statusText}`);
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const getCurrentAddress = async (): Promise<CurrentAddress> => {
    try {
        const response = await api.get('/customer/current-address');

        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;