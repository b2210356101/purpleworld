import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserType, UserInfo } from '../../types';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    userType: UserType;
    userInfo: UserInfo | null;
}

const initialState: AuthState = {
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
    userType: localStorage.getItem('roleType') as UserType || undefined,
    userInfo: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ token: string; role: string; username: string; profileImage: string | null }>) => {
            const { token, role, username, profileImage } = action.payload;

            // Validate role to ensure it's one of our UserType values
            let validRole: UserType = undefined;
            if (role === 'CUSTOMER' || role === 'RESTAURANT' ||
                role === 'COURIER' || role === 'ADMIN') {
                validRole = role as UserType;
            }

            // Update localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('roleType', role);
            localStorage.setItem('username', username);
            if (profileImage) {
                localStorage.setItem('profileImage', profileImage);
            }

            // Store user info
            const userInfo: UserInfo = {
                username: username,
                profileImage: profileImage || undefined
            };

            // Update state
            state.isAuthenticated = true;
            state.token = token;
            state.userType = validRole;
            state.userInfo = userInfo;
        },
        updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
            state.userInfo = action.payload;

            // Also update localStorage
            localStorage.setItem('username', action.payload.username);
            if (action.payload.profileImage) {
                localStorage.setItem('profileImage', action.payload.profileImage);
            }
        },
        registerSuccess: (state, action: PayloadAction<{ token: string; roleType: string; userInfo?: UserInfo }>) => {
            const { token, roleType, userInfo } = action.payload;

            let validRole: UserType = undefined;
            if (roleType === 'CUSTOMER' || roleType === 'RESTAURANT' ||
                roleType === 'COURIER' || roleType === 'ADMIN') {
                validRole = roleType as UserType;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('roleType', roleType);

            state.isAuthenticated = true;
            state.token = token;
            state.userType = validRole;
            if (userInfo) {
                state.userInfo = userInfo;
            }
        },
        logout: (state) => {
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('roleType');
            localStorage.removeItem('username');
            localStorage.removeItem('profileImage');

            // Reset state
            state.isAuthenticated = false;
            state.token = null;
            state.userType = undefined;
            state.userInfo = null;
        },
    },
});

export const { login, logout, updateUserInfo, registerSuccess } = authSlice.actions;
export default authSlice.reducer;