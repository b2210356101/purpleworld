import axios, { AxiosError } from 'axios';
import { getToken, logout } from './auth';
import {
    Address,
    AddToCartRequest,
    AddToCartResponse,
    CurrentAddress,
    Ingredient,
    MenuItem,
    MenuResponse, PlaceOrderRequest, PlaceOrderResponse,
    Restaurant, TrackingInfoResponseDTO, OrderGroupDTO,
    RestaurantResponseForAdmin, CourierResponseForAdmin,
    CustomerOrderSummaryDTO, OrderDetails, Stat,
    CourierOrder,
    CourierStats, AdminStats,
} from '../types';

const API_URL = 'https://purpleworld-production.up.railway.app';

/**
 * Creates an axios instance with authentication and error handling
 */
const createAxiosInstance = () => {
    const instance = axios.create({
        baseURL: API_URL,
        withCredentials: false, // CORS sorunlarını önlemek için false
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
        (error) => {
            return Promise.reject(error);
        }
    );

    // Handle 401 unauthorized errors
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

const api = createAxiosInstance();

interface BackendErrorResponse {
    error: string;
    message: string;
    status?: number;
}

// Auth Services
export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Registration Services
export const registerCourier = async (formData: {
    first_Name: string;
    last_Name: string;
    ssn: string;
    email: string;
    phone_Number: string;
    password: string;
}) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register/courier`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const registerCustomer = async (formData: {
    first_Name: string;
    last_Name: string;
    phone_Number: string;
    email: string;
    password: string;
}) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register/customer`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

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
    try {
        const dataToSend = {
            ...formData,
            profile_image: formData.profile_image || '',
        };
        const response = await axios.post(`${API_URL}/auth/register/restaurant`, dataToSend, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Address Services
export const getCustomerAddresses = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/addresses`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
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

        const token = getToken();
        const response = await axios.post(`${API_URL}/customer/address`, requestData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error saving address:', error);
        throw error;
    }
};

export const setCurrentAddress = async (addressId: number) => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/customer/set-current-address?addressId=${addressId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return true;
    } catch (error) {
        console.error('Error setting current address:', error);
        throw error;
    }
};

export const updateAddress = async (
    address: Address,
    location: { lat: number, lng: number } | null
): Promise<void> => {
    try {
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

        const token = getToken();
        const response = await axios.put(`${API_URL}/customer/address?addressId=${address.addressId}`, requestBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data) {
            throw new Error('Failed to update address');
        }
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

export const deleteAddress = async (addressId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.delete(`${API_URL}/customer/address?addressId=${addressId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Failed to delete address:', error);
        throw error;
    }
};

export const getCurrentAddress = async (): Promise<CurrentAddress | null> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/current-address`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
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

// Restaurant and Menu Services
export const getNearestRestaurants = async (): Promise<Restaurant[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/nearest-restaurants`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching nearest restaurants:', error);
        throw error;
    }
};

export const getPopularMenuItems = async (): Promise<MenuItem[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/popular-foods`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular menu items:', error);
        throw error;
    }
};

export const getIngredients = async (menuItemId: number): Promise<Ingredient[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/${menuItemId}/ingredients`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
    }
};

export const getRestaurantDetails = async (restaurantId: number): Promise<Restaurant> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/restaurants/${restaurantId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        throw error;
    }
};

export const getRestaurantMenuForCustomer = async (restaurantId: number): Promise<MenuResponse> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/restaurants/${restaurantId}/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurant menu:', error);
        throw error;
    }
};

// Cart Services
export const addToCart = async (req: AddToCartRequest): Promise<AddToCartResponse> => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/customer/cart/add`, req, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const viewCart = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/cart/view`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error viewing cart:', error);
        throw error;
    }
};

export const updateCartGroupNote = async (groupId: number, note: string) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_URL}/customer/cart/group/${groupId}/note`, { note }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating cart note:', error);
        throw error;
    }
};

export const updateItemQuantity = async (itemId: number, operation: string) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_URL}/customer/cart/item`, { operation, itemId }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating item quantity:', error);
        throw error;
    }
};

export const removeItemFromCart = async (itemId: number) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/customer/cart/item/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
    }
};

// Menu Management Services
export const getRestaurantMenu = async (): Promise<MenuResponse> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/restaurant/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurant menu:', error);
        throw error;
    }
};

export const addMenuCategory = async (categoryName: string) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/restaurant/menu/categories`, { name: categoryName }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding menu category:', error);
        throw error;
    }
};

export const deleteMenuCategory = async (categoryId: number) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/restaurant/menu/categories/${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting menu category:', error);
        throw error;
    }
};

export const addMenuItem = async (categoryId: number, menuItem: {
    name: string;
    price: number;
    description?: string;
    img?: string;
    removableElements?: string;
}) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/restaurant/menu/categories/${categoryId}/items`, menuItem, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding menu item:', error);
        throw error;
    }
};

export const updateMenuItem = async (itemId: number, menuItem: {
    name: string;
    price: number;
    description?: string;
    img?: string;
    removableElements?: string;
}) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_URL}/restaurant/menu/items/${itemId}`, menuItem, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
};

export const deleteMenuItem = async (itemId: number) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/restaurant/menu/items/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};

export const addRemovableElement = async (menuItemId: number, elementName: string) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/restaurant/menu/menu-items/${menuItemId}/removable-elements`, {
            name: elementName
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding removable element:', error);
        throw error;
    }
};

export const deleteRemovableElement = async (elementId: number) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/restaurant/menu/removable-elements/${elementId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting removable element:', error);
        throw error;
    }
};

// Verification Services
export const sendVerificationCode = async (email: string): Promise<void> => {
    try {
        await axios.post(`${API_URL}/verification/send-code`, { email }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error sending verification code:", error);
        throw error;
    }
};

export const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
    try {
        const response = await axios.post(`${API_URL}/verification/verify-code`, { email, code }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.status === 200;
    } catch (error) {
        console.error("Email verification failed:", error);
        return false;
    }
};

// Check Existence Services
export const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_URL}/auth/check-email?email=${email}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
};

export const checkSsnExists = async (ssn: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_URL}/auth/check-ssn?ssn=${ssn}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking SSN:', error);
        throw error;
    }
};

export const checkTaxIdExists = async (taxId: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_URL}/auth/check-tax-id?taxId=${taxId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking tax ID:', error);
        throw error;
    }
};

// Order Services
export const placeOrder = async (
    request: PlaceOrderRequest
): Promise<PlaceOrderResponse> => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/customer/order/place`, request, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
};

// Tracking Services
export const startTracking = async (
    orderId: number,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
): Promise<string> => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_URL}/tracking/start`, null, {
            params: { orderId, originLat, originLng, destLat, destLng },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error starting tracking:', error);
        throw error;
    }
};

export const getNextLocation = async (orderId: number): Promise<TrackingInfoResponseDTO> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/tracking/next?orderId=${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting next location:', error);
        throw error;
    }
};

export const getFullRoute = async (orderId: number) => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/tracking/full-route`, {
            params: { orderId },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting full route:', error);
        throw error;
    }
};

// Restaurant Order Services
export const getRestaurantOrders = async (): Promise<OrderGroupDTO[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/restaurant/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting restaurant orders:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getActiveOrdersForRestaurant = async (): Promise<OrderGroupDTO[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/restaurant/orders/active`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting active orders for restaurant:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const acceptOrder = async (orderGroupId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/restaurant/orders/${orderGroupId}/accept`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error accepting order:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const rejectOrder = async (orderGroupId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/restaurant/orders/${orderGroupId}/reject`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error rejecting order:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const markOrderAsPrepared = async (orderGroupId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/restaurant/orders/${orderGroupId}/prepared`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error marking order as prepared:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getCustomerOrderHistory = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/order/history`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting customer order history:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Admin Services
export const getAllRestaurants = async (): Promise<RestaurantResponseForAdmin[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/admin/restaurants`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all restaurants:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getCurrentOrders = async (): Promise<CustomerOrderSummaryDTO[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/orders/current`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting current orders:', error);
        throw error;
    }
};

export const cancelOrder = async (orderGroupId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/customer/orders/${orderGroupId}/cancel`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error canceling order:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as { error: string; message: string };
            throw errData;
        }
        throw error;
    }
};

export const getOrderDetails = async (orderGroupId: number): Promise<OrderDetails> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/customer/order/${orderGroupId}/details`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting order details:', error);
        throw error;
    }
};

export const getRestaurantStats = async (): Promise<Stat[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/restaurant/orders/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting restaurant stats:', error);
        throw error;
    }
};

// Courier Services
export const getCourierOrders = async (): Promise<CourierOrder[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/courier/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting courier orders:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const markOrderAsPickedUp = async (orderGroupId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/courier/orders/${orderGroupId}/picked-up`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error marking order as picked up:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getCourierStats = async (): Promise<CourierStats> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/courier/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting courier stats:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const updateCourierAvailability = async (): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/courier/availability`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error updating courier availability:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const deliveredOrder = async (orderGroupId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/courier/orders/${orderGroupId}/delivered`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Admin Restaurant Management
export const approveRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/restaurant/approve/${restaurantId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error approving restaurant:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const rejectRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/restaurant/reject/${restaurantId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error rejecting restaurant:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const banRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/restaurant/ban/${restaurantId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error banning restaurant:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const unbanRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/restaurant/unban/${restaurantId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error unbanning restaurant:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Courier Management API functions
export const getAllCouriers = async (): Promise<CourierResponseForAdmin[]> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/admin/couriers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all couriers:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const approveCourier = async (courierId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/courier/approve/${courierId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error approving courier:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const rejectCourier = async (courierId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/courier/reject/${courierId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error rejecting courier:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const banCourier = async (courierId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/courier/ban/${courierId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error banning courier:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const unbanCourier = async (courierId: number): Promise<void> => {
    try {
        const token = getToken();
        await axios.post(`${API_URL}/admin/courier/unban/${courierId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error unbanning courier:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting admin stats:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export default axios;