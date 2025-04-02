
import React from 'react';
import { Box, Toolbar, IconButton, Typography, Button, Grid, Stack, ButtonGroup } from '@mui/material';
import RestaurantItems, { Restaurant } from '../cart/RestaurantItems';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
    // Sample data
    const restaurants: Restaurant[] = [
        {
            id: 1,
            name: "McBurger",
            logo: "https://picsum.photos/80/80",
            items: [
                {
                    id: 1,
                    name: "Mor Dünya Salatası",
                    price: 120,
                    quantity: 1,
                    image: "https://picsum.photos/75/75"
                },
                {
                    id: 2,
                    name: "Brownie Tatlı",
                    price: 160,
                    quantity: 2,
                    image: "https://picsum.photos/70/70"
                }
            ]
        },
        {
            id: 2,
            name: "Domitoz Pizza",
            logo: "https://picsum.photos/82/82",
            items: [
                {
                    id: 1,
                    name: "Lahmacun",
                    price: 210.50,
                    quantity: 1,
                    image: "https://picsum.photos/30/85"
                },
                {
                    id: 2,
                    name: "Mor Dünya Salatası",
                    price: 108,
                    quantity: 1,
                    image: "https://picsum.photos/76/76"
                }
            ]
        }
    ];

    // Calculate total price across all restaurants
    const totalPrice = restaurants.reduce((total, restaurant) => {
        return total + restaurant.items.reduce((subtotal, item) => {
            return subtotal + (item.price * item.quantity);
        }, 0);
    }, 0);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', bgcolor: 'background.default' }}>
            <Toolbar sx={{ bgcolor: 'primary.main' }}>
                <Typography color="white" sx={{ flexGrow: 1, fontSize: 20 }}>
                    Your Cart
                </Typography>
                <IconButton sx={{ color: 'white' }} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Toolbar>

            {/* Restaurants and Items */}
            <Stack gap={3} sx={{ p: 2, bgcolor: 'background.default' }}>
                {restaurants.map(restaurant => (
                    <RestaurantItems key={restaurant.id} restaurant={restaurant} />
                ))}
            </Stack>

            {/* Go to cart button at the bottom */}
            <Box sx={{ mt: 'auto', bgcolor: 'primary.light' }}>
                {/* Summary */}
                <Box sx={{ p: 2 }}>
                    <Grid container sx={{ justifyContent: 'space-between' }} spacing={2} >
                        <Grid sx={{ size: 6 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography>
                                    Delivery Time
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: '16px', mr: 1, color: "text.secondary" }} />
                                <Typography>
                                    25 - 35 mins
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid sx={{ size: 6 }} >
                            <Typography>
                                Total Price
                            </Typography>
                            <Typography sx={{ fontSize: '20px', color: 'primary.main', fontWeight: '700', textAlign: 'right' }} >
                                {totalPrice}₺
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Action Buttons */}
                <ButtonGroup fullWidth >
                    <Button
                        variant="contained"
                        component={Link}
                        to="/cart"
                        sx={{
                            py: 1.5,
                            borderRadius: 0,
                            bgcolor: "secondary.main",
                        }}
                    >
                        Go to Cart
                    </Button>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/checkout"
                        sx={{
                            py: 1.5,
                            borderRadius: 0,
                            bgcolor: "primary.main",
                        }}
                    >
                        Pay Now
                    </Button>
                </ButtonGroup>
            </Box>
        </Box>
    );
};

export default CartDrawer;