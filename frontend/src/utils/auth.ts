import { UserType } from '../types';

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

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Get authorization header for API requests
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const setAuthData = (token: string, roleType: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('roleType', roleType);
  };

// Log out the user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roleType');
    window.location.href = '/';
};