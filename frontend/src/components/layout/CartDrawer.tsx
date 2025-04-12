import React, { useState, useEffect } from "react";
import {
    Box,
    Toolbar,
    IconButton,
    Typography,
    Button,
    ButtonGroup,
    CircularProgress,
    Alert,
    Divider,
} from "@mui/material";
import RestaurantItems from "../cart/RestaurantItems";
import {
    viewCart,
    updateItemQuantity,
    removeItemFromCart,
} from "../../utils/api";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import {
    ViewCartResponse,
    CartGroupResponse,
    CartItemResponse,
} from "../../types";


interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    refreshCartCount: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
    isOpen,
    onClose,
    refreshCartCount,
}) => {
    const [cartItems, setCartItems] = useState<CartGroupResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [discount, setDiscount] = useState<string>("0₺");
    const [totalAmount, setTotalAmount] = useState<string>("0₺");
    const [itemTotal, setItemTotal] = useState<string>("0₺");

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data: ViewCartResponse = await viewCart();

            // Filter out restaurant groups with no items and preserve item order
            const cleanedGroups = data.groups
                .filter((group) => group.items.length > 0)
                .map((group) => {
                    // Find existing group to maintain item order
                    const existingGroup = cartItems.find(
                        (g) => g.restaurantId === group.restaurantId
                    );
                    if (existingGroup) {
                        // Reorder items to match existing group's order
                        const orderedItems = existingGroup.items
                            .map((existingItem) =>
                                group.items.find((item) => item.itemId === existingItem.itemId)
                            )
                            .filter((item): item is CartItemResponse => !!item)
                            // Append new items at the end
                            .concat(
                                group.items.filter(
                                    (item) =>
                                        !existingGroup.items.some((ei) => ei.itemId === item.itemId)
                                )
                            );
                        return { ...group, items: orderedItems };
                    }
                    // For new groups, use server order
                    return group;
                });

            setCartItems(cleanedGroups);
            setItemTotal(`${data.cartTotal}₺`);
            setTotalAmount(`${data.cartTotal}₺`);
        } catch (err) {
            setError("Failed to load cart items. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (
        cartItemId: number,
        operation: "+" | "-",
        quantity: number
    ) => {
        try {
            if (operation === "-" && quantity === 1) {
                await removeItemFromCart(cartItemId);
            } else {
                await updateItemQuantity(cartItemId, operation);
            }
            await fetchCart(); // Re-fetch items for the drawer
            refreshCartCount(); // Update cart count in the header
        } catch (err: any) {
            console.error("Cart update error:", err);
            setError("Failed to update cart item.");
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100svh",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
                <Typography mt={2}>Loading your cart...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100svh",
                bgcolor: "background.default",
            }}
        >
            <Toolbar sx={{ bgcolor: "primary.main" }}>
                <Typography
                    color="white"
                    sx={{ flexGrow: 1, fontSize: 20, fontWeight: 600 }}
                >
                    Your Cart
                </Typography>
                <IconButton sx={{ color: "white" }} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Toolbar>

            {/* Scrollable area for restaurants & items */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                {cartItems.length === 0 ? (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="h6" mb={2}>
                            Your cart is empty
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={onClose}>
                            Continue Shopping
                        </Button>
                    </Box>
                ) : (
                    cartItems.map((group, index) => (
                        <Box key={group.restaurantId} mb={2}>
                            <RestaurantItems
                                restaurant={{
                                    id: group.restaurantId,
                                    restaurantName: group.restaurantName,
                                    items: group.items.map((item) => ({
                                        id: item.itemId,
                                        name: item.itemName,
                                        price: item.itemPrice,
                                        quantity: item.quantity,
                                        image: item.itemImg,
                                    })),
                                }}
                                onQuantityChange={handleQuantityChange}
                            />
                        </Box>
                    ))
                )}
            </Box>

            {/* ✅ Fixed cart summary at the bottom */}
            {cartItems.length > 0 && (
                <Box sx={{ mt: "auto" }}>
                    <Box sx={{ p: 3, bgcolor: "primary.light" }}>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            Cart Summary
                        </Typography>
                        <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography fontWeight={600} fontSize={14}>
                                    Item Total
                                </Typography>
                                <Typography fontWeight={600} fontSize={14}>
                                    {itemTotal}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography fontWeight={600} fontSize={14}>
                                    Discount
                                </Typography>
                                <Typography fontWeight={600} fontSize={14} color="green">
                                    {discount === "0₺" ? "0₺" : `-${discount}`}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <AccessTimeIcon
                                    sx={{ fontSize: "16px", mr: 1, color: "text.secondary" }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    25 - 35 mins
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700}>
                                {totalAmount}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <ButtonGroup fullWidth>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/cart"
                            sx={{ py: 1.5, borderRadius: 0, bgcolor: "secondary.main" }}
                            onClick={onClose}
                        >
                            Go to Cart
                        </Button>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/checkout"
                            sx={{ py: 1.5, borderRadius: 0, bgcolor: "primary.main" }}
                            onClick={onClose}
                        >
                            Pay Now
                        </Button>
                    </ButtonGroup>
                </Box>
            )}
        </Box>
    );
};

export default CartDrawer;
