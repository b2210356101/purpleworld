import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box, Container } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useEffect } from 'react';
import { login } from '../../store/slices/authSlice';
import ScrollToTop from '../ScrollToTop';

/**
 * Main layout component that wraps the application with header and footer
 */
const Layout = () => {
    const dispatch = useAppDispatch();
    const { userType, userInfo } = useAppSelector(state => state.auth);

    // Restore auth state from localStorage on page refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('roleType');
        const username = localStorage.getItem('username');

        if (token && storedUserType && username) {
            // Restore auth state with all user information
            dispatch(login({
                token,
                role: storedUserType,
                username,
                profileImage: localStorage.getItem('profileImage')
            }));
        }
    }, [dispatch]);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header
                userType={userType}
                username={userInfo?.username}
                profileImage={userInfo?.profileImage}
            />
            <ScrollToTop />
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