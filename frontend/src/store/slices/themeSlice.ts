import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaletteMode } from '@mui/material';

interface ThemeState {
    mode: PaletteMode;
}

const getInitialTheme = (): PaletteMode => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'light';
};

const initialState: ThemeState = {
    mode: getInitialTheme(),
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', state.mode);
        },
        setTheme: (state, action: PayloadAction<PaletteMode>) => {
            state.mode = action.payload;
            localStorage.setItem('themeMode', action.payload);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;