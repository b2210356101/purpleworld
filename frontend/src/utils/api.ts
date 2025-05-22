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
    MenuItemAvailabilityRequest,
    PageResponse,
    SearchResult, ReviewRequest, ReviewDTO,
    CouponResponse,
    CouponRequest, MinAmountError,
} from '../types';

const API_URL = 'https://purpleworld-production.up.railway.app';

// ai-gen start (claude 3.7)
/**
 * Creates an axios instance with authentication and error handling
 */
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
// ai-gen end

const api = createAxiosInstance();

interface BackendErrorResponse {
    error: string;
    message: string;
    status?: number;
}

export const loginUser = async (email: string, password: string) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }

        throw error;
    }
};

// Registration

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

// Address Services
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
        await api.post(`/customer/set-current-address?addressId=${addressId}`);
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
        const response = await api.put(`/customer/address?addressId=${address.addressId}`, requestBody);

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
        await api.delete(`/customer/address?addressId=${addressId}`);
    } catch (error) {
        console.error('Failed to delete address:', error);
        throw error;
    }
};

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


// Restaurant and Menu Services
// Get nearest restaurants
export const getNearestRestaurants = async (page = 0, size = 4): Promise<PageResponse<Restaurant>> => {
    const response = await api.get('/customer/nearest-restaurants', {
        params: { page, size }
    });
    return response.data;
};

// Get popular menu items
export const getPopularMenuItems = async (page = 0, size = 10): Promise<PageResponse<MenuItem>> => {
    const response = await api.get('/customer/popular-foods', {
        params: { page, size }
    });
    return response.data;
};

export const getIngredients = async (menuItemId: number): Promise<Ingredient[]> => {
    const response = await api.get(`/customer/${menuItemId}/ingredients`);
    return response.data;
};

export const getRestaurantDetails = async (restaurantId: number): Promise<Restaurant> => {
    const response = await api.get(`/customer/restaurants/${restaurantId}`);
    return response.data;
};

export const getRestaurantMenuForCustomer = async (restaurantId: number): Promise<MenuResponse> => {
    const response = await api.get(`/customer/restaurants/${restaurantId}/menu`);
    return response.data;
};

// Cart Services
export const addToCart = async (req: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await api.post('/customer/cart/add', req);
    return response.data;
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
    const response = await api.put('/customer/cart/item', { operation, itemId });
    return response.data;
};

export const removeItemFromCart = async (itemId: number) => {
    const response = await api.delete(`/customer/cart/item/${itemId}`);
    return response.data;
};

// Menu Management Services

// Fetches the restaurant's menu information
export const getRestaurantMenu = async (
    page = 0,
    size = 10,
    search = "",
    sort = "name",
    direction = "asc"
): Promise<MenuResponse> => {
    const response = await api.get('/restaurant/menu', {
        params: {
            page,
            size,
            search,
            sort,
            direction
        }
    });
    return response.data;
};

// Adds a new category to the restaurant's menu
export const addMenuCategory = async (categoryName: string) => {
    const response = await api.post('/restaurant/menu/categories', { name: categoryName });
    return response.data;
};

// Deletes a category from the restaurant's menu
export const deleteMenuCategory = async (categoryId: number) => {
    const response = await api.delete(`/restaurant/menu/categories/${categoryId}`);
    return response.data;
};

// Adds a new menu item to a specific category
export const addMenuItem = async (categoryId: number, menuItem: {
    name: string;
    price: number;
    description?: string;
    img?: string;
    removableElements?: string;
}) => {
    const response = await api.post(`/restaurant/menu/categories/${categoryId}/items`, menuItem);
    return response.data;
};

// Updates an existing menu item
export const updateMenuItem = async (itemId: number, menuItem: {
    name: string;
    price: number;
    description?: string;
    img?: string;
    removableElements?: string;
}) => {
    const response = await api.put(`/restaurant/menu/items/${itemId}`, menuItem);
    return response.data;
};

//Deletes a menu item
export const deleteMenuItem = async (itemId: number) => {
    const response = await api.delete(`/restaurant/menu/items/${itemId}`);
    return response.data;
};

//Adds a removable element to a menu item
export const addRemovableElement = async (menuItemId: number, elementName: string) => {
    const response = await api.post(`/restaurant/menu/menu-items/${menuItemId}/removable-elements`, {
        name: elementName
    });
    return response.data;
};

// Deletes a removable element
export const deleteRemovableElement = async (elementId: number) => {
    const response = await api.delete(`/restaurant/menu/removable-elements/${elementId}`);
    return response.data;
};

// Update Item Stock
export const updateMenuItemAvailability = async (
    itemId: number,
    data: MenuItemAvailabilityRequest
): Promise<void> => {
    try {
        await api.put(`/restaurant/menu/items/${itemId}/availability`, data);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as { error: string; message: string };
            throw errData;
        }
        throw error;
    }
};


export const sendVerificationCode = async (email: string): Promise<void> => {
    try {
        await api.post('/verification/send-code', { email });
    } catch (error) {
        console.error("Error sending verification code:", error);
        throw error;
    }
};

// Verify email code before registration
export const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
    try {
        const response = await api.post('/verification/verify-code', { email, code });
        return response.status === 200;
    } catch (error) {
        console.error("Email verification failed:", error);
        return false;
    }
};
export const checkEmailExists = async (email: string): Promise<boolean> => {
    const response = await api.get(`/auth/check-email?email=${email}`);
    return response.data;
};

export const checkSsnExists = async (ssn: string): Promise<boolean> => {
    const response = await api.get(`/auth/check-ssn?ssn=${ssn}`);
    return response.data;
};

export const checkTaxIdExists = async (taxId: string): Promise<boolean> => {
    const response = await api.get(`/auth/check-tax-id?taxId=${taxId}`);
    return response.data;
};



export const placeOrder = async (
    request: PlaceOrderRequest
): Promise<PlaceOrderResponse> => {
    const resp = await api.post<PlaceOrderResponse>(
        "/customer/order/place",
        request
    );
    return resp.data;
};

export const startTracking = async (
    orderId: number,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
): Promise<string> => {
    const response = await api.post(`/tracking/start`, null, {
        params: { orderId, originLat, originLng, destLat, destLng }
    });
    return response.data;
};

export const getNextLocation = async (orderId: number): Promise<TrackingInfoResponseDTO> => {
    const response = await api.get(`/tracking/next?orderId=${orderId}`);
    return response.data;
};
export const getFullRoute = async (orderId: number) => {
    const response = await api.get(`/tracking/full-route`, {
        params: { orderId }
    });
    return response.data;
};

export const getRestaurantOrders = async (): Promise<OrderGroupDTO[]> => {
    try {
        const response = await api.get('/restaurant/orders');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};


export const getActiveOrdersForRestaurant = async (): Promise<OrderGroupDTO[]> => {
    try {
        const response = await api.get('/restaurant/orders/active');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const acceptOrder = async (orderGroupId: number): Promise<void> => {
    try {
        await api.post(`/restaurant/orders/${orderGroupId}/accept`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const rejectOrder = async (orderGroupId: number): Promise<void> => {
    try {
        await api.post(`/restaurant/orders/${orderGroupId}/reject`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const markOrderAsPrepared = async (orderGroupId: number): Promise<void> => {
    try {
        await api.post(`/restaurant/orders/${orderGroupId}/prepared`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getCustomerOrderHistory = async () => {
    try {
        const response = await api.get('/customer/order/history');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Admin restaurant management API
export const getAllRestaurants = async (): Promise<RestaurantResponseForAdmin[]> => {
    try {
        const response = await api.get('/admin/restaurants');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};
export const getCurrentOrders = async (): Promise<CustomerOrderSummaryDTO[]> => {
    const response = await api.get("/customer/orders/current");
    return response.data;
};

export const cancelOrder = async (orderGroupId: number): Promise<void> => {
    try {
        await api.post(`/customer/orders/${orderGroupId}/cancel`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as { error: string; message: string };
            throw errData;
        }
        throw error;
    }
};

export const getOrderDetails = async (orderGroupId: number): Promise<OrderDetails> => {
    const response = await api.get(`/customer/order/${orderGroupId}/details`);
    return response.data;
};

export const getRestaurantStats = async (): Promise<Stat[]> => {
    const response = await api.get(`/restaurant/orders/stats`);
    return response.data;
};

export const getCourierOrderHistory = async (): Promise<CourierOrder[]> => {
    try {
        const response = await api.get('/courier/orders/history');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Get assigned orders for courier
export const getCourierOrders = async (): Promise<CourierOrder[]> => {
    try {
        const response = await api.get('/courier/orders');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};


// Mark order as picked up
export const markOrderAsPickedUp = async (orderGroupId: number): Promise<void> => {
    try {
        await api.post(`/courier/orders/${orderGroupId}/picked-up`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Get courier statistics
export const getCourierStats = async (): Promise<CourierStats> => {
    try {
        const response = await api.get('/courier/stats');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Update courier availability status
export const updateCourierAvailability = async (): Promise<void> => {
    try {
        await api.post('/courier/availability');
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Courier delivered
export const deliveredOrder = async (orderGroupId: number): Promise<void> => {
    try {
        await api.post(`/courier/orders/${orderGroupId}/delivered`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const approveRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        await api.post(`/admin/restaurant/approve/${restaurantId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const rejectRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        await api.post(`/admin/restaurant/reject/${restaurantId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const banRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        await api.post(`/admin/restaurant/ban/${restaurantId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const unbanRestaurant = async (restaurantId: number): Promise<void> => {
    try {
        await api.post(`/admin/restaurant/unban/${restaurantId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};


// Courier management API functions
export const getAllCouriers = async (): Promise<CourierResponseForAdmin[]> => {
    try {
        const response = await api.get('/admin/couriers');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const approveCourier = async (courierId: number): Promise<void> => {
    try {
        await api.post(`/admin/courier/approve/${courierId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const rejectCourier = async (courierId: number): Promise<void> => {
    try {
        await api.post(`/admin/courier/reject/${courierId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const banCourier = async (courierId: number): Promise<void> => {
    try {
        await api.post(`/admin/courier/ban/${courierId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const unbanCourier = async (courierId: number): Promise<void> => {
    try {
        await api.post(`/admin/courier/unban/${courierId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        const response = await api.get('/admin/stats');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

// Search for restaurants by query
export const searchRestaurants = async (query: string): Promise<SearchResult[]> => {
    try {
        const response = await api.get(`/search`, {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching restaurants:', error);
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

/**
 * Send the “forgot password” email with reset link
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        await api.post('/auth/forgot-password', { email });
    } catch (err) {
        if (err instanceof AxiosError && err.response) {
            throw err.response.data;
        }
        throw err;
    }
};

/**
 * Complete the reset by providing the token from the link and your new password
 */
export const resetPassword = async (
    token: string,
    newPassword: string
): Promise<void> => {
    try {
        await api.post('/auth/reset-password', { token, newPassword });
    } catch (err) {
        if (err instanceof AxiosError && err.response) {
            throw err.response.data;
        }
        throw err;
    }
};
export const submitReview = async (
    orderGroupId: number,
    payload: ReviewRequest
): Promise<void> => {
    try {
        await api.post(`/customer/orders/${orderGroupId}/review`, payload);
    } catch (err) {
        if (err instanceof AxiosError && err.response) {
            throw err.response.data;
        }
        throw err;
    }
};

export const getRestaurantReviews = async (): Promise<ReviewDTO[]> => {
    try {
        const response = await api.get('/restaurant/orders/reviews');
        return response.data;
    } catch (err) {
        if (err instanceof AxiosError && err.response) {
            throw err.response.data;
        }
        throw err;
    }
};

export const replyToReview = async (orderGroupId: string | number, reply: string): Promise<void> => {
    try {
        await api.post(`/restaurant/orders/reviews/${orderGroupId}/reply`, reply);
    } catch (err) {
        if (err instanceof AxiosError && err.response) {
            throw err.response.data;
        }
        throw err;
    }
};

export const getRestaurantReviewsForCustomer = async (restaurantId: number): Promise<ReviewDTO[]> => {
    try {
        const response = await api.get(`/customer/restaurants/${restaurantId}/reviews`);
        return response.data;
    } catch (err) {
        console.error("Error fetching customer reviews:", err);
        throw err;
    }
};

export const getAllReviews = async (): Promise<ReviewDTO[]> => {
  try {
    const response = await api.get('/admin/reviews');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errData = error.response.data as BackendErrorResponse;
      throw errData;
    }
    throw error;
  }
};


export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await api.delete(`/admin/reviews/${reviewId}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errData = error.response.data as BackendErrorResponse;
      throw errData;
    }
    throw error;
  }
};

export const deleteRestaurantReply = async (reviewId: number): Promise<void> => {
  try {
    await api.delete(`/admin/reviews/${reviewId}/reply`);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errData = error.response.data as BackendErrorResponse;
      throw errData;
    }
    throw error;
  }
};

// Check if a restaurant is in favorites
export const checkIsFavorite = async (restaurantId: number): Promise<boolean> => {
    try {
        const response = await api.get(`/customer/favorites/${restaurantId}`);
        return response.data.isFavorite;
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return false;
    }
};

// Get all favorite restaurants
export const getFavoriteRestaurants = async (): Promise<Restaurant[]> => {
    try {
        const response = await api.get('/customer/favorites');
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

// Add a restaurant to favorites
export const addToFavorites = async (restaurantId: number): Promise<boolean> => {
    try {
        const response = await api.post(`/customer/favorites/${restaurantId}`);
        return true;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        return false;
    }
};

// Remove a restaurant from favorites
export const removeFromFavorites = async (restaurantId: number): Promise<boolean> => {
    try {
        const response = await api.delete(`/customer/favorites/${restaurantId}`);
        return true;
    } catch (error) {
        console.error('Error removing from favorites:', error);
        return false;
    }
};

// Coupon management API functions for admin
export const getAllCoupons = async (): Promise<CouponResponse[]> => {
    try {
        const response = await api.get('/admin/coupons/list');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const createCoupon = async (couponData: CouponRequest): Promise<void> => {
    try {
        await api.post('/admin/coupons/create', couponData);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const updateCoupon = async (couponId: number, couponData: CouponRequest): Promise<void> => {
    try {
        await api.put(`/admin/coupons/update/${couponId}`, couponData);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};

export const deleteCoupon = async (couponId: number): Promise<void> => {
    try {
        await api.delete(`/admin/coupons/delete/${couponId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            const errData = error.response.data as BackendErrorResponse;
            throw errData;
        }
        throw error;
    }
};
// Functions needed for profile management
export const getUserProfile = async (): Promise<any> => {
    const userType = localStorage.getItem('roleType');
    try {
        // Route based on user type
        let endpoint = '';
        switch (userType) {
            case 'CUSTOMER':
                endpoint = '/customer/profile';
                break;
            case 'RESTAURANT':
                endpoint = '/restaurant/profile';
                break;
            case 'COURIER':
                endpoint = '/courier/profile';
                break;
            case 'ADMIN':
                // If you have an admin profile endpoint
                endpoint = '/admin/profile';
                break;
            default:
                throw new Error('Unknown user type');
        }

        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (profileData: any): Promise<any> => {
    const userType = localStorage.getItem('roleType');
    try {
        // Route based on user type
        let endpoint = '';
        switch (userType) {
            case 'CUSTOMER':
                endpoint = '/customer/profile';
                break;
            case 'RESTAURANT':
                endpoint = '/restaurant/profile';
                break;
            case 'COURIER':
                endpoint = '/courier/profile';
                break;
            case 'ADMIN':
                // If you have an admin profile endpoint
                endpoint = '/admin/profile';
                break;
            default:
                throw new Error('Unknown user type');
        }

        const response = await api.put(endpoint, profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

export const changePassword = async ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }): Promise<any> => {
    const userType = localStorage.getItem('roleType');
    try {
        // Route based on user type
        let endpoint = '';
        switch (userType) {
            case 'CUSTOMER':
                endpoint = '/customer/profile/change-password';
                break;
            case 'RESTAURANT':
                endpoint = '/restaurant/profile/change-password';
                break;
            case 'COURIER':
                endpoint = '/courier/profile/change-password';
                break;
            case 'ADMIN':
                // If you have an admin change password endpoint
                endpoint = '/admin/profile/change-password';
                break;
            default:
                throw new Error('Unknown user type');
        }

        const response = await api.post(endpoint, {
            currentPassword: oldPassword,
            newPassword
        });
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};
// Get restaurant statistics (for restaurant)
export const getRestaurantProfileStats = async () => {
    try {
        const response = await api.get('/restaurant/profile');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch restaurant statistics:', error);
        throw error;
    }
};

// Get courier statistics (for courier)
export const getCourierProfileStats = async () => {
    try {
        const response = await api.get('/courier/profile');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch courier statistics:', error);
        throw error;
    }
};

// Update restaurant details (for restaurant)
export const updateRestaurantDetails = async (details: {
    openingHours?: string;
    closingHours?: string;
    description?: string;
    cuisineType?: string;
}) => {
    try {
        const response = await api.put('/restaurant/profile/details', details);
        return response.data;
    } catch (error) {
        console.error('Failed to update restaurant details:', error);
        throw error;
    }
};

export const checkMinimumAmounts = async (): Promise<MinAmountError[]> => {
    try {
        const response = await api.get('/customer/cart/check-amount');
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            throw error.response.data;
        }
        throw error;
    }
};

export const applyCoupon = async (code: string) => {
    try {
        const response = await api.post('/customer/cart/apply-coupon', null, {
            params: { code }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCartSummary = async () => {
    const response = await api.get('/customer/cart/summary');
    return response.data;
};

export const getAllCouponsforCustomer = async (): Promise<CouponResponse[]> => {
  try {
    const response = await api.get('/customer/coupons/list');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;