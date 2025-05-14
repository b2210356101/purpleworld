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
    Skeleton,
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
import { useTranslation } from "react-i18next";
import Loading from "../Loading";

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
    const { t } = useTranslation();
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
            setError(t('cart.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (
        cartItemId: number,
        operation: "+" | "-",
        quantity: number,
        groupId: number
    ) => {
        try {
            setCartItems((prev) =>
                prev.map((group) => {
                    if (group.groupId === groupId) {
                        const updatedItems = group.items
                            .map((item) => {
                                if (item.itemId === cartItemId) {
                                    if (operation === "-" && quantity === 1) {
                                        return null; // Mark for removal
                                    }
                                    const newQuantity =
                                        operation === "+" ? quantity + 1 : quantity - 1;
                                    return { ...item, quantity: newQuantity };
                                }
                                return item;
                            })
                            .filter((item): item is CartItemResponse => item !== null);

                        return { ...group, items: updatedItems };
                    }
                    return group;
                }).filter((group) => group.items.length > 0)
            );

            if (operation === "-" && quantity === 1) {
                await removeItemFromCart(cartItemId);
            } else {
                await updateItemQuantity(cartItemId, operation);
            }

            const data = await viewCart();
            const cleanedGroups = data.groups
                .filter((group: { items: any[]; }) => group.items.length > 0)
                .map((group: { restaurantId: number; items: any[]; }) => {
                    const existingGroup = cartItems.find(
                        (g) => g.restaurantId === group.restaurantId
                    );
                    if (existingGroup) {
                        const orderedItems = existingGroup.items
                            .map((existingItem) =>
                                group.items.find((item) => item.itemId === existingItem.itemId)
                            )
                            .filter((item): item is CartItemResponse => !!item)
                            .concat(
                                group.items.filter(
                                    (item) =>
                                        !existingGroup.items.some((ei) => ei.itemId === item.itemId)
                                )
                            );
                        return { ...group, items: orderedItems };
                    }
                    return group;
                });

            setCartItems(cleanedGroups);
            setItemTotal(`${data.cartTotal}₺`);
            setTotalAmount(`${data.cartTotal}₺`);
            refreshCartCount();
        } catch (err: any) {
            console.error("Cart update error:", err);
            setError(t('cart.error'));
            await fetchCart();
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => window.location.reload()}
                >
                    {t('cart.tryAgain')}
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
                    {t('cart.yourCart')}
                </Typography>
                <IconButton sx={{ color: "white" }} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Toolbar>

            {/* Scrollable area for restaurants & items */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                {loading ? (<Loading />) : cartItems.length === 0 ? (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="h6" mb={2}>
                            {t('cart.cartIsEmpty')}
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={onClose}>
                            {t('cart.continueShopping')}
                        </Button>
                    </Box>
                ) : (
                    cartItems.map((group) => (
                        <Box key={group.restaurantId} mb={2}>
                            <RestaurantItems
                                restaurant={{
                                    id: group.restaurantId,
                                    restaurantName: group.restaurantName,
                                    distanceInKm: 0,
                                    rating: 0,
                                    profileImg: "",
                                    reviews: 0,
                                    items: group.items.map((item) => ({
                                        id: item.itemId,
                                        name: item.itemName,
                                        price: item.itemPrice,
                                        quantity: item.quantity,
                                        image: item.itemImg,
                                    })),
                                }}
                                onQuantityChange={(cartItemId, operation, quantity) =>
                                    handleQuantityChange(cartItemId, operation, quantity, group.groupId)
                                }
                            />
                        </Box>
                    ))
                )}
            </Box>


            {/* Fixed cart summary at the bottom */}
            {cartItems.length > 0 || loading ? (
                <Box sx={{ mt: "auto" }}>
                    {loading ? (
                        // Skeleton for cart summary section during loading
                        <Box sx={{ p: 3, bgcolor: "primary.light" }}>
                            <Skeleton variant="text" width="50%" sx={{ mb: 2 }} />
                            <Box mb={2}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Skeleton variant="text" width="30%" />
                                    <Skeleton variant="text" width="20%" />
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Skeleton variant="text" width="30%" />
                                    <Skeleton variant="text" width="20%" />
                                </Box>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="20%" />
                            </Box>
                            <Skeleton
                                variant="rectangular"
                                height={48}
                                sx={{ mt: 3, borderRadius: 2 }}
                            />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ p: 3, bgcolor: "primary.light" }}>
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                    {t('cart.cartSummary')}
                                </Typography>
                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography fontWeight={600} fontSize={14}>
                                            {t('cart.itemTotal')}
                                        </Typography>
                                        <Typography fontWeight={600} fontSize={14}>
                                            {itemTotal}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography fontWeight={600} fontSize={14}>
                                            {t('cart.discount')}
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
                                            25 - 35 {t('cart.estimatedTime')}
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
                                    {t('cart.goToCart')}
                                </Button>
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/checkout"
                                    sx={{ py: 1.5, borderRadius: 0, bgcolor: "primary.main" }}
                                    onClick={onClose}
                                >
                                    {t('cart.payNow')}
                                </Button>
                            </ButtonGroup>
                        </>
                    )}
                </Box>
            ) : null}
        </Box>
    );
};

export default CartDrawer;