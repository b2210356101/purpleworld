// ai-gen start (claude sonnet 3.7, 0)
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// ai-gen end