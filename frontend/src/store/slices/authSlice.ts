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
  userInfo: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; roleType: string; userInfo?: UserInfo }>) => {
      const { token, roleType, userInfo } = action.payload;
      
      // Validate roleType to ensure it's one of our UserType values
      let validRole: UserType = undefined;
      if (roleType === 'CUSTOMER' || roleType === 'RESTAURANT' || 
          roleType === 'COURIER' || roleType === 'ADMIN') {
        validRole = roleType as UserType;
      }

      // Update localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('roleType', roleType);

      // Update state
      state.isAuthenticated = true;
      state.token = token;
      state.userType = validRole;
      if (userInfo) {
        state.userInfo = userInfo;
      }
    },
    updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    logout: (state) => {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('roleType');

      // Reset state
      state.isAuthenticated = false;
      state.token = null;
      state.userType = undefined;
      state.userInfo = null;
    },
  },
});

export const { login, logout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;