import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack
} from '@mui/material';
import DrawerItem, { CartItem } from './DrawerItem';

// Define restaurant type
export interface Restaurant {
    id: number;
    name: string;
    logo: string;
    items: CartItem[];
}

// Define props interface for RestaurantItems
interface RestaurantItemsProps {
    restaurant: Restaurant;
}

const RestaurantItems: React.FC<RestaurantItemsProps> = ({ restaurant }) => {
    return (
        <Paper sx={{ bgcolor: "primary.light", textAlign: 'center', py: 2 }}>
            {/* Restaurant Info */}
            <Box
                component="img"
                sx={{
                    height: 40,
                    width: 40,
                    borderRadius: 10
                }}
                src={restaurant.logo}
                alt='restaurant.name'
            />
            <Typography sx={{ fontWeight: "bold", mb: 2 }}>
                {restaurant.name}
            </Typography>

            {/* Cart Items */}
            <Stack sx={{ px: 2 }} gap={2}>
                {restaurant.items.map((item) => (
                    <DrawerItem key={item.id} item={item} />
                ))}
            </Stack>
        </Paper>
    );
};

export default RestaurantItems;