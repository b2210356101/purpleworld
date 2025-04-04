import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box, Container } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useEffect } from 'react';
import { login } from '../../store/slices/authSlice';

/**
 * Main layout component that wraps the application with header and footer
 */
const Layout = () => {
    const dispatch = useAppDispatch();
    const { userType } = useAppSelector(state => state.auth);

    // Restore auth state from localStorage on page refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('roleType');

        if (token && storedUserType) {
            dispatch(login({
                token,
                roleType: storedUserType,
            }));
        }
    }, [dispatch]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header userType={userType} />
            
            <Container component="main" sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                py: 3 
            }}>
                <Outlet />
            </Container>
            
            <Footer />
        </Box>
    );
};

export default Layout;