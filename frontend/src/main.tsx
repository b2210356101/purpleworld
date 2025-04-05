import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { Provider } from 'react-redux';
import { store } from './store';


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme} >
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>,
);
