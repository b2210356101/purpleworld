import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from './store';

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const mode = useSelector((state: RootState) => state.theme.mode);
    const theme = React.useMemo(() => createAppTheme(mode), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeWrapper>
                <RouterProvider router={router} />
            </ThemeWrapper>
        </Provider>
    </React.StrictMode>
);