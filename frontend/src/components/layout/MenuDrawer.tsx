import { Link } from 'react-router-dom';
import { Box, Toolbar, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Button, Typography, Stack, ButtonGroup } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReviewsIcon from '@mui/icons-material/Reviews';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { isAuthenticated } from '../../utils/auth';

interface MenuDrawerProps {
    onClose: () => void;
    onLogout: () => void;
}

// User-specific menu items
const getMenuItems = () => {
    switch (localStorage.getItem('role')) {
        case 'CUSTOMER':
            return [
                { text: 'Home', icon: <HomeIcon />, path: '/' },
                { text: 'Restaurants', icon: <RestaurantIcon />, path: '/restaurants' },
                { text: 'Favorites', icon: <FavoriteIcon />, path: '/favorites' },
                { text: 'My Orders', icon: <ReceiptIcon />, path: '/orders' },
                { text: 'About Us', icon: <InfoIcon />, path: '/about' },
                { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' },
            ];
        case 'RESTAURANT':
            return [
                { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
                { text: 'Orders', icon: <ReceiptIcon />, path: '/restaurant/orders' },
                { text: 'Reviews', icon: <ReviewsIcon />, path: '/restaurant/reviews' },
                { text: 'Menu Management', icon: <MenuBookIcon />, path: '/restaurant/menu' },
                { text: 'About Us', icon: <InfoIcon />, path: '/about' },
                { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' },
            ];
        case 'COURIER':
            return [
                { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
                { text: 'About Us', icon: <InfoIcon />, path: '/about' },
                { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' },
            ];
        case 'ADMIN':
            return [
                { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
                { text: 'User Management', icon: <AccountCircleIcon />, path: '/admin/users' },
                { text: 'Restaurant Management', icon: <RestaurantIcon />, path: '/admin/restaurants' },
                { text: 'Reviews Management', icon: <ReviewsIcon />, path: '/admin/reviews' },
                { text: 'Promotion Management', icon: <CardGiftcardIcon />, path: '/admin/promotions' },
                { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' },
            ];
        default:
            return [
                { text: 'Home', icon: <HomeIcon />, path: '/' },
                { text: 'Restaurants', icon: <RestaurantIcon />, path: '/restaurants' },
                { text: 'About Us', icon: <InfoIcon />, path: '/about' },
                { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' },
            ];
    }
};

const MenuDrawer = ({ onClose, onLogout }: MenuDrawerProps) => {
    const menuItems = getMenuItems();
    const isLoggedIn = isAuthenticated();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', bgcolor: 'background.default' }}>
            <Toolbar sx={{ bgcolor: 'primary.main', justifyContent: 'space-between' }}>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>

                {/* Language Switch */}
                <ButtonGroup variant="text" sx={{ color: 'white' }}>
                    <Button
                        // onClick={() => onLanguageChange('tr')}
                        sx={{
                            fontWeight: 'bold',
                            bgcolor: 'white',
                            px: 1
                        }}
                    >
                        TR
                    </Button>
                    <Button
                        // onClick={() => onLanguageChange('en')}
                        sx={{
                            fontWeight: 'regular',
                            color: 'inherit',
                            px: 1
                        }}
                    >
                        EN
                    </Button>
                </ButtonGroup>
            </Toolbar>
            <Stack
                display="flex"
                sx={{
                    background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                    height: '200px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    py: 3,
                }}
            >
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        mb: 1,
                        border: '2px solid white'
                    }}
                />

                {!isLoggedIn ? (
                    <>
                        <Typography sx={{ fontSize: 18, fontWeight: 'medium' }}>
                            Hello!
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/login"
                            onClick={onClose}
                            sx={{
                                mt: 1,
                                bgcolor: 'secondary.main',
                            }}
                        >
                            Login
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography sx={{ fontSize: 18, fontWeight: 'medium' }}>
                            Hello, {localStorage.getItem('username')}!
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/profile"
                            onClick={onClose}
                            sx={{
                                mt: 1,
                                bgcolor: 'secondary.main',
                            }}
                        >
                            Edit Profile
                        </Button>
                    </>
                )}
            </Stack>

            <Box sx={{ flexGrow: 1 }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{ color: 'inherit' }}>
                            <ListItemButton onClick={onClose}>
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>


            <Box>
                {/* Dark / Light Mode */}
                <List>
                    <ListItem disablePadding sx={{ color: 'inherit' }}>
                        <ListItemButton onClick={onClose}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, pr: 1 }}>
                                <Brightness4Icon />
                            </ListItemIcon>
                            <ListItemText primary={'Dark'} />
                        </ListItemButton>
                        <ListItemButton onClick={onClose}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, pr: 1 }}>
                                <SettingsBrightnessIcon />
                            </ListItemIcon>
                            <ListItemText primary={'System'} />
                        </ListItemButton>
                        <ListItemButton onClick={onClose}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, pr: 1 }}>
                                <Brightness7Icon />
                            </ListItemIcon>
                            <ListItemText primary={'Light'} />
                        </ListItemButton>
                    </ListItem>
                </List>

                {isLoggedIn && (<Button
                    variant='contained'
                    onClick={onLogout}
                    startIcon={<LogoutIcon />}
                    sx={{
                        bgcolor: 'secondary.main',
                        width: '100%',
                        borderRadius: 0,
                        py: 1.5,
                    }}
                >
                    Logout
                </Button>
                )}
            </Box>
        </Box >
    );
};

export default MenuDrawer;