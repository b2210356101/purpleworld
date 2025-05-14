import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Drawer,
    Avatar,
    Button,
    Typography,
    Stack,
    InputBase,
    Badge,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import MenuDrawer from "./MenuDrawer";
import CartDrawer from "./CartDrawer";
import {
    UserType,
} from "../../types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { useTranslation } from "react-i18next";
import { fetchCartCountAsync } from "../../store/slices/cartSlice";

interface HeaderProps {
    userType: UserType;
    username?: string;
    profileImage?: string;
}

const Header: React.FC<HeaderProps> = ({
    userType,
    username,
    profileImage,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.up("sm"));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { count: cartCount } = useAppSelector((state) => state.cart);

    const location = useLocation();
    const isCartPage = location.pathname === "/cart";

    const [searchText, setSearchText] = useState('');

    // Fetch cart count on mount and when cart drawer closes
    useEffect(() => {
        if (userType === "CUSTOMER" && isAuthenticated) {
            dispatch(fetchCartCountAsync());
        }
    }, [userType, isAuthenticated, dispatch]);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleCartDrawerToggle = () => {
        setCartOpen(!cartOpen);
        // Refresh cart count when closing the drawer to sync with updates
        if (cartOpen) {
            dispatch(fetchCartCountAsync());
        }
    };

    const handleLogout = () => {
        navigate("/");
        handleDrawerToggle();
        dispatch(logout());
    };

    // Right side content based on user type
    const renderRightSideContent = () => {
        const { t } = useTranslation();

        if (!isAuthenticated) {
            return (
                <Stack direction="row">
                    <Button
                        color="inherit"
                        component={Link}
                        to="/login"
                        endIcon={<LoginIcon />}
                    >
                        {isMobile ? <>{t('homepage.hero.login')}</> : <></>}
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/register"
                        endIcon={<PersonAddIcon />}
                    >
                        {isMobile ? <>{t('register.common.registerButton')}</> : <></>}
                    </Button>
                </Stack>
            );
        } else {
            return (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {isMobile ? (
                        <Typography sx={{ mr: 1 }}>{t('homepage.hero.hello')}, {username}!</Typography>
                    ) : (
                        <></>
                    )}
                    <IconButton component={Link} to="/profile">
                        <Avatar
                            sx={{ width: 32, height: 32 }}
                            src={profileImage || undefined}
                            alt={username || "User"}
                        >
                            {username?.charAt(0) || "U"}
                        </Avatar>
                    </IconButton>

                    {/* Cart icon is shown only for customers */}
                    {userType === "CUSTOMER" && !isCartPage && (
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (searchText.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
            setSearchText('')
        }
    };

    // Show search bar only for guest and customer
    const shouldShowSearchBar =
        isMobile && (!isAuthenticated || userType === "CUSTOMER");

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ bgcolor: "primary.main" }}>
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

                <Box component={Link} to="/" sx={{ display: "flex" }}>
                    <img
                        src="/src/assets/logo.svg"
                        alt="Logo"
                        height="30"
                        style={{
                            marginRight: "10px",
                            filter: "brightness(0) invert(1)", // white
                        }}
                    />
                </Box>

                {/* Search section - Only for guest and customer */}
                {shouldShowSearchBar ? (
                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                                borderRadius: "50px",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                                },
                                width: "330px",
                                display: "flex",
                                alignItems: "center",
                                px: 2,
                                py: 0.5,
                            }}
                        >
                            <InputBase
                                placeholder={t('restaurant.searchHeader')}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                sx={{
                                    color: "white",
                                    width: "100%",
                                    "& ::placeholder": {
                                        color: "rgba(255, 255, 255, 0.7)",
                                        opacity: 1,
                                    },
                                }}
                            />
                            <IconButton
                                type="submit"
                                sx={{ color: "white", p: 0.5 }}
                            >
                                <SearchIcon />
                            </IconButton>
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
                    sx={{ "& .MuiDrawer-paper": { boxSizing: "border-box", width: 360 } }}
                >
                    <MenuDrawer onClose={handleDrawerToggle} onLogout={handleLogout} />
                </Drawer>

                {/* Right drawer - Cart for customer */}
                {userType === "CUSTOMER" && (
                    <Drawer
                        variant="temporary"
                        anchor="right"
                        open={cartOpen}
                        onClose={handleCartDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: 360,
                            },
                        }}
                    >
                        <CartDrawer
                            isOpen={cartOpen}
                            onClose={handleCartDrawerToggle}
                            refreshCartCount={() => dispatch(fetchCartCountAsync())}
                        />
                    </Drawer>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;