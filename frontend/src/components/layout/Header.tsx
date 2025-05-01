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
    ViewCartResponse,
} from "../../types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { viewCart } from "../../utils/api";

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
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.up("sm"));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState<number>(0); // Dynamic cart count

    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const location = useLocation();
    const isCartPage = location.pathname === "/cart";

    // Fetch cart count on mount and when cart drawer closes
    useEffect(() => {
        const handleCartUpdated = () => {
            fetchCartCount();
        };

        if (userType === "CUSTOMER" && isAuthenticated) {
            fetchCartCount();
        }

        window.addEventListener("cart-updated", handleCartUpdated);

        return () => {
            window.removeEventListener("cart-updated", handleCartUpdated);
        };
    }, [userType, isAuthenticated]);

    const fetchCartCount = async () => {
        try {
            const data: ViewCartResponse = await viewCart();
            // Calculate total quantity of items in the cart
            const totalItems = data.groups.reduce((sum, group) => {
                return (
                    sum +
                    group.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
                );
            }, 0);
            setCartCount(totalItems);
            localStorage.setItem("cartCount", totalItems.toString());
        } catch (err) {
            console.error("Failed to fetch cart count:", err);
            setCartCount(0); // Reset to 0 on error to avoid misleading count
        }
    };

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleCartDrawerToggle = () => {
        setCartOpen(!cartOpen);
        // Refresh cart count when closing the drawer to sync with updates
        if (cartOpen) {
            fetchCartCount();
        }
    };

    const handleLogout = () => {
        navigate("/");
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
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {isMobile ? (
                        <Typography sx={{ mr: 1 }}>Hello, {username}!</Typography>
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
                        src="/src/assets/logo.png"
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
                                width: "300px",
                                display: "flex",
                                alignItems: "center",
                                px: 2,
                                py: 0.5,
                            }}
                        >
                            <InputBase
                                placeholder="Search restaurants & foods..."
                                sx={{
                                    color: "white",
                                    width: "100%",
                                    "& ::placeholder": {
                                        color: "rgba(255, 255, 255, 0.7)",
                                        opacity: 1,
                                    },
                                }}
                            />
                            <SearchIcon sx={{ color: "white", ml: 1 }} />
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
                            refreshCartCount={fetchCartCount}
                        />
                    </Drawer>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
