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

const API_URL = 'https://purpleworld-production.up.railway.app/api';

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

export const updateAddress = async (
    address: Address,
    location: { lat: number, lng: number } | null
): Promise<void> => {
    try {
        const token = localStorage.getItem('token');

        // Prepare request body
        const requestBody = {
            name: address.name || "",
            buildingNumber: address.buildingNumber,
            apartmentNumber: address.apartmentNumber,
            fullAddress: address.fullAddress,
            floor: address.floor,
            phoneNumber: address.phoneNumber,
            deliveryNote: address.deliveryNote || "",
            latitude: location?.lat,
            longitude: location?.lng
        };


        // Make the API call
        const response = await fetch(`${API_URL}/customer/address?addressId=${address.addressId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update address');
        }
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
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


export async function getNearestRestaurants(): Promise<Restaurant[]> {
    const { data } = await api.get<Restaurant[]>('/customer/nearest-restaurants');
    return data;
}

export async function getPopularMenuItems(): Promise<MenuItem[]> {
    const { data } = await api.get<MenuItem[]>('/customer/popular-foods');
    return data;
}

export async function getIngredients(menuItemId: number): Promise<Ingredient[]> {
    const { data } = await api.get<Ingredient[]>(`/customer/${menuItemId}/ingredients`);
    return data;
}

export async function addToCart(req: AddToCartRequest): Promise<AddToCartResponse> {
    const token = localStorage.getItem('token');

    const { data } = await api.post<AddToCartResponse>(
        '/customer/cart/add',
        req,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );

    return data;
}

// View cart
export const viewCart = async () => {
    const response = await api.get("/customer/cart/view");
    return response.data;
};


// Update cart group note
export const updateCartGroupNote = async (groupId: number, note: string) => {
    console.log(`API call: updateCartGroupNote - groupId: ${groupId}, note: ${note}`);

    const response = await api.put(`/customer/cart/group/${groupId}/note`, {
        note,
    });

    console.log("API response:", response.data);
    return response.data;
};

// Update item quantity

export const updateItemQuantity = async (itemId: number, operation: string) => {
    console.log(
        `API call: updateItemQuantity - itemId: ${itemId}, operation: ${operation}`
    );

    const response = await api.put("/customer/cart/item", {
        operation,
        itemId,
    });

    console.log("API response:", response.data);
    return response.data;
};

// Remove item
export const removeItemFromCart = async (itemId: number) => {
    const token = getToken();
    console.log(`Token available: ${!!token}`);
    const response = await api.delete(`/customer/cart/item/${itemId}`);
    return response.data;
};
export default api;
