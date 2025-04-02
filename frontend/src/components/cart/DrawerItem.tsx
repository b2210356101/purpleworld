import React from 'react';
import { Paper, Grid, Box, Stack, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Define the item type
export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

// Define props interface
interface DrawerItemProps {
    item: CartItem;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ item }) => {
    return (
        <Paper key={item.id} sx={{ p: 1, borderRadius: '8px' }}>
            <Grid container sx={{ alignItems: 'center' }}>
                <Grid size={3} sx={{ display: 'flex' }}>
                    <Box
                        component="img"
                        sx={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 10,
                        }}
                        src={item.image}
                        alt={item.name}
                    />
                </Grid>
                <Grid size={9} >
                    <Box sx={{ display: "flex", alignItems: 'center', justifyContent: "space-between", ml: 1, gap: 1 }}>
                        <Stack sx={{ textAlign: 'left' }}>
                            <Typography sx={{ fontSize: 15 }}>
                                {item.name}
                            </Typography>

                            <Typography color="primary" fontWeight="medium">
                                {item.price}₺
                            </Typography>
                        </Stack>

                        <Stack sx={{ display: "flex", alignItems: "center", bgcolor: 'primary.light', borderRadius: 5 }}>
                            <IconButton size="small" sx={{ border: 1 }}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2">
                                {item.quantity}
                            </Typography>

                            {item.quantity === 1 ?
                                <IconButton size="small" sx={{ border: 1 }} >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                                :
                                <IconButton size="small" sx={{ border: 1 }}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                            }
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default DrawerItem
