import { Box, Paper, Stack, Typography, Button, IconButton, Tooltip, Rating, CircularProgress } from "@mui/material";
import { Restaurant } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { addToFavorites, removeFromFavorites, checkIsFavorite } from "../../utils/api";
import { getToken } from "../../utils/auth";

const RestaurantCard: React.FC<{ 
    restaurant: Restaurant, 
    initialFavorite?: boolean,
    refreshFavorites?: () => void,
    disabled?: boolean
}> = ({ 
    restaurant, 
    initialFavorite = false,
    refreshFavorites,
    disabled = false
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    const [isLoading, setIsLoading] = useState(false);
    
    // Check favorite status when component mounts or restaurant changes
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (getToken()) {
                try {
                    const favoriteStatus = await checkIsFavorite(restaurant.id);
                    setIsFavorite(favoriteStatus);
                } catch (error) {
                    console.error('Error checking favorite status:', error);
                }
            }
        };
        
        // Update local state if initialFavorite changes
        setIsFavorite(initialFavorite);
        
        // Only check status if not passed as prop
        if (initialFavorite === false) {
            checkFavoriteStatus();
        }
    }, [restaurant.id, initialFavorite]);
    
    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        const token = getToken();
        
        // If user is not logged in, redirect to login
        if (!token) {
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        
        setIsLoading(true);
        
        try {
            if (isFavorite) {
                // Remove from favorites
                await removeFromFavorites(restaurant.id);
                setIsFavorite(false);
                
                // Refresh favorites list if refreshFavorites function is provided
                if (refreshFavorites) {
                    refreshFavorites();
                }
            } else {
                // Add to favorites
                await addToFavorites(restaurant.id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Tooltip
            title={disabled ? t('favorites.out_of_range', 'This restaurant is out of delivery range') : ''}
            placement="top"
            arrow
        >
        <Paper
            sx={{
                borderRadius: 4,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                        transform: disabled ? "none" : "translateY(-3px)",
                        boxShadow: disabled ? undefined : '0px 0px 10px rgba(132, 94, 194, 0.4)',
                    },
                filter: disabled ? 'grayscale(20%)' : 'none',
                opacity: disabled ? 0.8 : 1,
            }}
        >
            <Box sx={{ position: "relative" }}>
                <Box
                    component="img"
                    src={restaurant.profileImg || "https://i.hizliresim.com/m0taj04.jpg"}
                    alt={restaurant.restaurantName}
                    sx={{
                        width: "100%",
                        borderRadius: 4,
                        aspectRatio: "4/3",
                        objectFit: "cover",
                        filter: disabled ? 'grayscale(60%)' : 'none',
                    }}
                />
                
                {/* Favorite Button */}
                <Tooltip
                    title={
                        !getToken() 
                            ? t('restaurant.loginToFavorite')
                            : isFavorite 
                                ? t('restaurant.removeFromFavorites') 
                                : t('restaurant.addToFavorites')
                    }
                    arrow
                    placement="bottom"
                >
                    <IconButton
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                        disabled={isLoading}
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
                            opacity: 1, 
                            '&:hover': {
                                bgcolor: isFavorite ? 'secondary.dark' : 'white',
                                transform: 'scale(1.1)',
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(255,255,255,0.7)',
                                color: 'rgba(0,0,0,0.26)',
                            }
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            isFavorite ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>

            <Stack sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="medium" noWrap>
                    {restaurant.restaurantName}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {restaurant.reviews !== 0 && (
                            <Rating
                                value={restaurant.rating}
                                precision={0.1}
                                readOnly
                                size="small"
                            />
                        )}
                        <Typography variant="body2">
                            {restaurant.reviews === 0 || restaurant.rating === 0
                                ? t('restaurant.new')
                                : `(${restaurant.rating?.toFixed(1)}) - ${restaurant.reviews}`}
                        </Typography>
                    </Box>

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 500,
                            color: disabled ? 'secondary.main' : 'inherit'
                        }}
                    >
                        {restaurant.distanceInKm !== undefined && `${restaurant.distanceInKm.toFixed(1)} km`}
                    </Typography>
                </Box>

                <Button 
                    fullWidth 
                    component={Link} 
                    to={`/restaurants/${restaurant.id}`} 
                    variant="outlined" 
                    disabled={disabled}
                    sx={{ 
                        py: 1,
                        transition: 'all 0.3s',
                        '&:hover': {
                            bgcolor: disabled ? undefined : 'primary.main',
                            color: disabled ? undefined : 'white'
                        },
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    {disabled ? t('favorites.too_far') : t('restaurant.view')}
                </Button>
            </Stack>
        </Paper>
        </Tooltip>
    );
};

export default RestaurantCard;