import { Box, Paper, Stack, Typography, Button, IconButton, Tooltip, Rating } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Restaurant } from "../../types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useState } from "react";

const RestaurantCard: React.FC<{ 
    restaurant: Restaurant, 
    initialFavorite?: boolean 
}> = ({ 
    restaurant, 
    initialFavorite = false 
}) => {
    const { t } = useTranslation();
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    
    const toggleFavorite = (e: React.MouseEvent) => {
        setIsFavorite(!isFavorite);
    };

    return (
        <Paper
            sx={{
                borderRadius: 4,
                transition: "transform 0.3s",
                "&:hover": {
                    transform: "translateY(-5px)",
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                <Box
                    component="img"
                    src={restaurant.profileImg}
                    alt={restaurant.restaurantName}
                    sx={{
                        width: "100%",
                        borderRadius: 4,
                        aspectRatio: "4/3",
                        objectFit: "cover",
                    }}
                />
                
                {/* Favorite Button */}
                <Tooltip
                    title={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                    arrow
                    placement="top"
                >
                    <IconButton
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: isFavorite ? 'secondary.main' : 'rgba(255,255,255,0.9)',
                            color: isFavorite ? 'white' : 'secondary.main',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            zIndex: 2,
                            transition: 'all 0.2s ease',
                            width: 36,
                            height: 36,
                            '&:hover': {
                                bgcolor: isFavorite ? 'secondary.dark' : 'white',
                                transform: 'scale(1.1)',
                            },
                        }}
                    >
                        {isFavorite ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Stack sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="medium" noWrap>
                    {restaurant.restaurantName}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {restaurant.rating && (
                            <Rating
                                value={restaurant.rating}
                                precision={0.5}
                                readOnly
                                size="small"
                            />                            
                        )}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            ({restaurant.rating}) - {restaurant.reviews}
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {restaurant.distanceInKm && `${restaurant.distanceInKm.toFixed(1)} km`}
                    </Typography>
                </Box>

                <Button fullWidth component={Link} to={`/restaurants/${restaurant.id}`} variant="outlined" sx={{ py: 1 }}>
                    {t('restaurant.view')}
                </Button>
            </Stack>
        </Paper>
    );
};

export default RestaurantCard;