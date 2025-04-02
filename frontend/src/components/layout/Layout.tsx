import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box, Container } from '@mui/material';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Header userType='customer' />
			
            <Container component="main" sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Outlet />
            </Container>

            <Footer />
        </Box>
    );
};

export default Layout;