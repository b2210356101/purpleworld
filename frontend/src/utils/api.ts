import axios, { AxiosError } from 'axios';
import { getToken, logout } from './auth';
import {
    Address,
    AddToCartRequest,
    AddToCartResponse,
    CurrentAddress,
    Ingredient,
    MenuItem,
    Restaurant,
} from '../types';

const API_URL = 'https://purpleworld-production.up.railway.app';

const createAxiosInstance = () => {
    const instance = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
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
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                logout();
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const api = createAxiosInstance();

// Login
export const loginUser = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
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
export const getCustomerAddresses = async () => {
    const response = await api.get('/customer/addresses');
    return response.data;
};

export const saveAddress = async (
    address: Omit<Address, 'id'>,
    location: { lat: number; lng: number } | null
): Promise<Address> => {
    if (!location) {
        throw new Error('Please select a location on the map');
    }

    const requestData = {
        name: address.name || '',
        buildingNumber: address.buildingNumber,
        apartmentNumber: address.apartmentNumber,
        fullAddress: address.fullAddress,
        floor: address.floor,
        phoneNumber: address.phoneNumber,
        deliveryNote: address.deliveryNote || '',
        latitude: location.lat,
        longitude: location.lng,
    };

    const response = await api.post('/customer/address', requestData);
    return response.data;
};

export const setCurrentAddress = async (addressId: number) => {
    const response = await api.post(`/customer/set-current-address`, null, {
        params: { addressId }
    });
    return response.data;
};

export const updateAddress = async (
    address: Address,
    location: { lat: number; lng: number } | null
): Promise<void> => {
    const requestBody = {
        name: address.name || '',
        buildingNumber: address.buildingNumber,
        apartmentNumber: address.apartmentNumber,
        fullAddress: address.fullAddress,
        floor: address.floor,
        phoneNumber: address.phoneNumber,
        deliveryNote: address.deliveryNote || '',
        latitude: location?.lat,
        longitude: location?.lng,
    };

    await api.put(`/customer/address`, requestBody, {
        params: { addressId: address.addressId }
    });
};

interface BackendErrorResponse {
    error: string;
    message: string;
    status?: number;
}

export const getCurrentAddress = async (): Promise<CurrentAddress | null> => {
    try {
        const response = await api.get('/customer/current-address');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            if (errData.error === 'No selected address.') {
                console.warn('No address found for customer:', errData.message);
                return null;
            }
            throw errData;
        }
        throw error;
    }
};

export const getNearestRestaurants = async (): Promise<Restaurant[]> => {
    const { data } = await api.get<Restaurant[]>('/customer/nearest-restaurants');
    return data;
};

export const getPopularMenuItems = async (): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItem[]>('/customer/popular-foods');
    return data;
};

export const getIngredients = async (menuItemId: number): Promise<Ingredient[]> => {
    const { data } = await api.get<Ingredient[]>(`/customer/${menuItemId}/ingredients`);
    return data;
};

export const addToCart = async (req: AddToCartRequest): Promise<AddToCartResponse> => {
    const { data } = await api.post<AddToCartResponse>('/customer/cart/add', req);
    return data;
};

export const viewCart = async () => {
    const response = await api.get('/customer/cart/view');
    return response.data;
};

export const updateCartGroupNote = async (groupId: number, note: string) => {
    const response = await api.put(`/customer/cart/group/${groupId}/note`, { note });
    return response.data;
};

export const updateItemQuantity = async (itemId: number, operation: string) => {
    const response = await api.put('/customer/cart/item', { itemId, operation });
    return response.data;
};

export const removeItemFromCart = async (itemId: number) => {
    const response = await api.delete(`/customer/cart/item/${itemId}`);
    return response.data;
};

export default api;
