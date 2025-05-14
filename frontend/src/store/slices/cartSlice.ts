import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addToCart as addToCartApi, viewCart } from '../../utils/api';
import { RemovableElementDTO, ViewCartResponse } from '../../types';

interface AddToCartPayload {
    menuItemId: number;
    quantity: number;
    removableElements: RemovableElementDTO[];
}

interface CartState {
    items: any[];
    count: number;
    isLoading: boolean;
    error: string | null;
}

// Add to cart async thunk
export const addToCartAsync = createAsyncThunk(
    'cart/addToCart',
    async (payload: AddToCartPayload, { rejectWithValue }) => {
        try {
            const apiPayload = {
                menuItemId: payload.menuItemId,
                quantity: payload.quantity,
                removableElements: payload.removableElements || []
            };

            await addToCartApi(apiPayload);

            const cartData: ViewCartResponse = await viewCart();

            const totalItems = cartData.groups.reduce((sum, group) => {
                return sum + group.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
            }, 0);

            return totalItems;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return rejectWithValue('Failed to add item to cart');
        }
    }
);

// Fetch cart count async thunk
export const fetchCartCountAsync = createAsyncThunk(
    'cart/fetchCount',
    async (_, { rejectWithValue }) => {
        try {
            const cartData: ViewCartResponse = await viewCart();

            const totalItems = cartData.groups.reduce((sum, group) => {
                return sum + group.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
            }, 0);

            return totalItems;
        } catch (error) {
            console.error('Error fetching cart count:', error);
            return rejectWithValue(0);
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            return 0; // Return 0 as the new count
        } catch (error) {
            return rejectWithValue('Failed to clear cart');
        }
    }
);

const initialState: CartState = {
    items: [],
    count: 0,
    isLoading: false,
    error: null
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.count = action.payload;
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCartCountAsync.fulfilled, (state, action) => {
                state.count = action.payload;
            })
            .addCase(clearCartAsync.fulfilled, (state) => {
                state.count = 0;
                state.items = [];
            });
    }
});

export default cartSlice.reducer;