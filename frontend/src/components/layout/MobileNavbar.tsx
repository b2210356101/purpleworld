import React from 'react';
import { BottomNavigation, BottomNavigationAction, Badge, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
    Home as HomeIcon,
    Restaurant as RestaurantIcon,
    Search as SearchIcon,
    Favorite as FavoriteIcon,
    ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface MobileNavProps {
    onSearchClick: () => void;
    isAuthenticated: boolean;
    cartCount?: number;
}

const MobileNavBar: React.FC<MobileNavProps> = ({
    onSearchClick,
    isAuthenticated,
    cartCount = 0
}) => {
    const { t } = useTranslation();
    const location = useLocation();
    const currentPath = location.pathname;

    // Determine active tab based on current path
    const getActiveTab = () => {
        if (currentPath === '/') return 0;
        if (currentPath.includes('/restaurants')) return 1;
        if (currentPath.includes('/cart')) return 2;
        if (currentPath.includes('/favorites')) return 3;
        if (currentPath.includes('/search')) return 4;
        return 0; // Default to home
    };

    // Determine cart path based on authentication
    const cartPath = isAuthenticated ? '/cart' : '/login';

    const navItems = [
        { label: t('nav.home'), icon: <HomeIcon />, path: '/' },
        { label: t('nav.restaurants'), icon: <RestaurantIcon />, path: '/restaurants' },
        {
            label: t('nav.cart'),
            icon: (
                <Badge
                    badgeContent={isAuthenticated ? cartCount : 0}
                    color="error"
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: '0.65rem',
                            fontWeight: 'bold'
                        }
                    }}
                >
                    <CartIcon />
                </Badge>
            ),
            path: cartPath
        },
        { label: t('nav.favorites'), icon: <FavoriteIcon />, path: isAuthenticated ? '/favorites' : '/login' },
        { label: t('nav.search'), icon: <SearchIcon />, onClick: onSearchClick }
    ];

    const renderBottomNavigationAction = (item: any, index: number) => {
        if (item.onClick) {
            return (
                <BottomNavigationAction
                    key={index}
                    label={item.label}
                    icon={item.icon}
                    onClick={item.onClick}
                    sx={{
                        '& .MuiBottomNavigationAction-label': {
                            fontWeight: 500,
                            transition: '0.2s'
                        }
                    }}
                />
            );
        }

        return (
            <BottomNavigationAction
                key={index}
                label={item.label}
                icon={item.icon}
                onClick={() => { }}
                component={Link}
                to={item.path}
                sx={{
                    '& .MuiBottomNavigationAction-label': {
                        fontWeight: 500,
                        transition: '0.2s'
                    }
                }}
            />
        );
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: -1,
                left: 0,
                right: 0,
                zIndex: 1100,
                display: { xs: 'block', sm: 'none' },
                borderRadius: '20px 20px 0 0',
                overflow: 'hidden',
                boxShadow: '0px -4px 15px rgba(0,0,0,0.08)'
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={getActiveTab()}
                sx={{
                    height: 64,
                    background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                    '& .MuiBottomNavigationAction-root': {
                        color: 'rgba(255,255,255,0.7)',
                        minWidth: 'auto',
                        px: 1,
                        transition: 'all 0.3s',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 3,
                            borderRadius: '0 0 4px 4px',
                            backgroundColor: 'white',
                            transition: 'width 0.3s'
                        }
                    },
                    '& .Mui-selected': {
                        color: 'white!important',
                        borderBottomColor: 'white',
                        '&:before': {
                            width: 24
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            transform: 'translateY(-2px)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        },
                        '& svg': {
                            transform: 'translateY(-2px) scale(1.1)',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                        }
                    },
                    '& .MuiBottomNavigationAction-label': {
                        opacity: 1,
                        fontSize: '0.68rem',
                        transition: 'all 0.2s'
                    },
                    '& svg': {
                        transition: 'all 0.3s'
                    }
                }}
            >
                {navItems.map((item, index) => renderBottomNavigationAction(item, index))}
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNavBar;