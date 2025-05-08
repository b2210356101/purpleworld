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
import InventoryIcon from '@mui/icons-material/Inventory';
import { isAuthenticated } from '../../utils/auth';
import { useAppSelector } from '../../store/hooks';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setTheme } from '../../store/slices/themeSlice';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';

interface MenuDrawerProps {
    onClose: () => void;
    onLogout: () => void;
}

// User-specific menu items
const getMenuItems = () => {
    const { t } = useTranslation();

    switch (localStorage.getItem('roleType')) {
        case 'CUSTOMER':
            return [
                { text: t('menu.home'), icon: <HomeIcon />, path: '/' },
                { text: t('menu.restaurants'), icon: <RestaurantIcon />, path: '/restaurants' },
                { text: t('menu.favorites'), icon: <FavoriteIcon />, path: '/favorites' },
                { text: t('menu.myOrders'), icon: <ReceiptIcon />, path: '/orders' },
                { text: t('menu.aboutUs'), icon: <InfoIcon />, path: '/about' },
                { text: t('menu.contact'), icon: <ContactSupportIcon />, path: '/contact' },
            ];
        case 'RESTAURANT':
            return [
                { text: t('menu.dashboard'), icon: <DashboardIcon />, path: '/' },
                { text: t('menu.orders'), icon: <ReceiptIcon />, path: '/restaurant/orders' },
                { text: t('menu.reviews'), icon: <ReviewsIcon />, path: '/restaurant/reviews' },
                { text: t('menu.menuManagement'), icon: <MenuBookIcon />, path: '/restaurant/menu' },
                { text: t('menu.stockManagement'), icon: <InventoryIcon />, path: '/restaurant/stock' },
                { text: t('menu.aboutUs'), icon: <InfoIcon />, path: '/about' },
                { text: t('menu.contact'), icon: <ContactSupportIcon />, path: '/contact' },
            ];
        case 'COURIER':
            return [
                { text: t('menu.dashboard'), icon: <DashboardIcon />, path: '/' },
                { text: t('menu.orders'), icon: <ReceiptIcon />, path: '/courier/orders' },
                { text: t('menu.aboutUs'), icon: <InfoIcon />, path: '/about' },
                { text: t('menu.contact'), icon: <ContactSupportIcon />, path: '/contact' },
            ];
        case 'ADMIN':
            return [
                { text: t('menu.dashboard'), icon: <DashboardIcon />, path: '/' },
                { text: t('menu.userManagement'), icon: <AccountCircleIcon />, path: '/admin/users' },
                { text: t('menu.restaurantManagement'), icon: <RestaurantIcon />, path: '/admin/restaurants' },
                { text: t('menu.courierManagement'), icon: <DeliveryDiningIcon />, path: '/admin/couriers' },
                { text: t('menu.reviewsManagement'), icon: <ReviewsIcon />, path: '/admin/reviews' },
                { text: t('menu.promotionManagement'), icon: <CardGiftcardIcon />, path: '/admin/promotions' },
                { text: t('menu.contact'), icon: <ContactSupportIcon />, path: '/contact' },
            ];
        default: // GUEST
            return [
                { text: t('menu.home'), icon: <HomeIcon />, path: '/' },
                { text: t('menu.restaurants'), icon: <RestaurantIcon />, path: '/restaurants' },
                { text: t('menu.aboutUs'), icon: <InfoIcon />, path: '/about' },
                { text: t('menu.contact'), icon: <ContactSupportIcon />, path: '/contact' },
            ];
    }
};

const MenuDrawer = ({ onClose, onLogout }: MenuDrawerProps) => {
    const { t } = useTranslation();
    const menuItems = getMenuItems();
    const isLoggedIn = isAuthenticated();
    const { userInfo } = useAppSelector(state => state.auth);
    const dispatch = useDispatch();
    const currentThemeMode = useSelector((state: RootState) => state.theme.mode);

    const handleThemeChange = (mode: 'light' | 'dark') => {
        dispatch(setTheme(mode));
        if (onClose) onClose();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', bgcolor: 'background.default' }}>
            <Toolbar sx={{ bgcolor: 'primary.main', justifyContent: 'space-between' }}>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>

                {/* Language Switch */}
                <ButtonGroup variant="text" sx={{ color: 'white' }}>
                    <Button
                        onClick={() => { i18n.changeLanguage('tr'); onClose(); }}
                        sx={{
                            fontWeight: i18n.language === 'tr' ? 'bold' : 'regular',
                            bgcolor: i18n.language === 'tr' ? 'white' : 'transparent',
                            color: i18n.language === 'tr' ? 'primary.main' : 'inherit',
                            px: 1
                        }}
                    >
                        TR
                    </Button>
                    <Button
                        onClick={() => { i18n.changeLanguage('en'); onClose(); }}
                        sx={{
                            fontWeight: i18n.language === 'en' ? 'bold' : 'regular',
                            bgcolor: i18n.language === 'en' ? 'white' : 'transparent',
                            color: i18n.language === 'en' ? 'primary.main' : 'inherit',
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
                    src={userInfo?.profileImage || undefined}
                    alt={userInfo?.username || 'User'}
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        mb: 1,
                        fontSize: 48,
                        border: '2px solid white'
                    }}
                >
                    {userInfo?.username?.charAt(0) || undefined}
                </Avatar>

                {!isLoggedIn ? (
                    <>
                        <Typography sx={{ fontSize: 18, fontWeight: 'medium' }}>
                            {t('homepage.hero.hello')}!
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
                            {t('homepage.hero.login')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography sx={{ fontSize: 18, fontWeight: 'medium' }}>
                            {t('homepage.hero.hello')}, {localStorage.getItem('username')}!
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
                            {t('menu.editProfile')}
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
                    <ListItem disablePadding sx={{ color: 'inherit', display: 'flex' }}>
                        <ListItemButton
                            onClick={() => handleThemeChange('dark')}
                            selected={currentThemeMode === 'dark'}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, pr: 1 }}>
                                <Brightness4Icon />
                            </ListItemIcon>
                            <ListItemText primary={t('menu.dark')} />
                        </ListItemButton>

                        <ListItemButton
                            onClick={() => handleThemeChange('light')}
                            selected={currentThemeMode === 'light'}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, pr: 1 }}>
                                <Brightness7Icon />
                            </ListItemIcon>
                            <ListItemText primary={t('menu.light')} />
                        </ListItemButton>
                    </ListItem>
                </List>

                {isLoggedIn && (
                    <Button
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
                        {t('menu.logout')}
                    </Button>
                )}
            </Box>
        </Box >
    );
};

export default MenuDrawer;