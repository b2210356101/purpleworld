import { UserInfo, UserType } from '../types';

// Get authentication token from localStorage
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Get user role from localStorage
export const getUserRole = (): UserType => {
    const role = localStorage.getItem('roleType');

    if (role === 'CUSTOMER' || role === 'RESTAURANT' || role === 'COURIER' || role === 'ADMIN') {
        return role as UserType;
    }

    return undefined;
};

// Get user information
export const getUserInfo = (): UserInfo | null => {
    const username = localStorage.getItem('username');
    if (!username) return null;

    return {
        username,
        profileImage: localStorage.getItem('profileImage') || undefined
    };
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Get authorization header for API requests
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Log out the user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roleType');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImage');
    window.location.href = '/';
};