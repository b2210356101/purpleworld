
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Snackbar,
    Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';

import CustomerProfileSection from '../components/profile/CustomerProfileSection';
import RestaurantProfileSection from '../components/profile/RestaurantProfileSection';
import CourierProfileSection from '../components/profile/CourierProfileSection';

const ProfileManagement: React.FC = () => {
    const { t } = useTranslation();
    const { userType } = useAppSelector(state => state.auth);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning'
    });

    useEffect(() => {
        setUserRole(localStorage.getItem('roleType'));
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // Update snackbar state (to be passed to child components)
    const updateSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    }, []);

    // Use useMemo to prevent recreating the profile component on every render
    const profileContent = useMemo(() => {
        // Use the value from Redux state first, fallback to localStorage
        const role = userType || userRole;
        
        switch (role) {
            case 'CUSTOMER':
                return <CustomerProfileSection updateSnackbar={updateSnackbar} />;
            case 'RESTAURANT':
                return <RestaurantProfileSection updateSnackbar={updateSnackbar} />;
                return (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography>Restaurant profile not yet implemented.</Typography>
                    </Box>
                );
            case 'COURIER':
                return <CourierProfileSection updateSnackbar={updateSnackbar} />;
                return (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography>Courier profile not yet implemented.</Typography>
                    </Box>
                );
            case 'ADMIN':
                return (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography>Admin profile not implemented.</Typography>
                    </Box>
                );
            default:
                return (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography>User role not recognized.</Typography>
                    </Box>
                );
        }
    }, [userType, userRole, updateSnackbar]);

    return (
        <Container sx={{ px: { xs: 1, md: 4 }, py: 4 }}>
            {/* Gradient background */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '320px',
                    background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                    zIndex: 0
                }}
            />

            <Typography variant="h4" sx={{
                mb: 4,
                color: 'white',
                position: 'relative',
                zIndex: 1,
                fontWeight: 'bold'
            }}>
                {t('profile.title')}
            </Typography>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {profileContent}
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfileManagement;
