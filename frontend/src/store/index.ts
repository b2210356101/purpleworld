// ai-gen start (claude sonnet 3.7, 0)
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import cartReducer from './slices/cartSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// ai-gen end