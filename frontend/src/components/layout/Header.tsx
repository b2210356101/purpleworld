import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, IconButton, Box, Drawer, Avatar, Button, Typography, Stack, InputBase, Badge, useMediaQuery, useTheme
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import MenuDrawer from './MenuDrawer';
import CartDrawer from './CartDrawer';
import { UserType } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';


const Header = ({ userType }: { userType: UserType }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.up('sm'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount] = useState(2); // cart count

    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector(state => state.auth);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleCartDrawerToggle = () => setCartOpen(!cartOpen);
    const handleLogout = () => {
        navigate('/');
        handleDrawerToggle();
        dispatch(logout());
    };

    // Right side content based on user type
    const renderRightSideContent = () => {
        if (!isAuthenticated) {
            return (
                <Stack direction="row">
                    <Button
                        color="inherit"
                        component={Link}
                        to="/login"
                        endIcon={<LoginIcon />}
                    >
                        {isMobile ? <>Login</> : <></>}
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/register"
                        endIcon={<PersonAddIcon />}
                    >
                        {isMobile ? <>Register</> : <></>}
                    </Button>
                </Stack>
            );
        } else {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isMobile ? <Typography sx={{ mr: 1 }}>
                        Hello, {userType}!
                    </Typography> : <></>}
                    <IconButton
                        component={Link}
                        to="/profile"
                    >
                        <Avatar sx={{ width: 32, height: 32 }} />
                    </IconButton>

                    {/* Cart icon is shown only for customers */}
                    {userType === 'CUSTOMER' && (
                        <IconButton color="inherit" onClick={handleCartDrawerToggle}>
                            <Badge badgeContent={cartCount} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                    )}
                </Box>
            );
        }
    };

    // Show search bar only for guest and customer
    const shouldShowSearchBar = isMobile && (!isAuthenticated || userType === 'CUSTOMER');

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ bgcolor: 'primary.main' }}>
                {/* Left side - Menu icon and logo */}
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 1 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box
                    component={Link}
                    to="/"
                    sx={{ display: 'flex' }}
                >
                    <img
                        src="/assets/logo.png"                        
                        alt="Logo"
                        height="30"
                        style={{
                            marginRight: '10px',
                            filter: 'brightness(0) invert(1)' // white
                        }}
                    />
                </Box>

                {/* Search section - Only for guest and customer */}
                {shouldShowSearchBar ? (
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: '50px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                },
                                width: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                px: 2,
                                py: 0.5,
                            }}
                        >
                            <InputBase
                                placeholder="Search restaurants & foods..."
                                sx={{
                                    color: 'white',
                                    width: '100%',
                                    '& ::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        opacity: 1
                                    }
                                }}
                            />
                            <SearchIcon sx={{ color: 'white', ml: 1 }} />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ flexGrow: 1 }} />
                )}

                {/* Right side content */}
                {renderRightSideContent()}

                {/* Left drawer - Menu */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 360 } }}
                >
                    <MenuDrawer
                        userType={userType}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        onLogout={handleLogout}
                    />
                </Drawer>

                {/* Right drawer - Cart for customer */}
                {userType === 'CUSTOMER' && (
                    <Drawer
                        variant="temporary"
                        anchor="right"
                        open={cartOpen}
                        onClose={handleCartDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box', width: 360
                            }
                        }}
                    >
                        <CartDrawer
                            open={cartOpen}
                            onClose={handleCartDrawerToggle}
                        />
                    </Drawer>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;

function dispatch(arg0: any) {
    throw new Error('Function not implemented.');
}
