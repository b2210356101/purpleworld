import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Restaurant } from "../../types";

const renderRatingStars = (rating: number) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            {[...Array(5)].map((_, index) => (
                <StarIcon key={index} sx={{ color: index < rating ? "#FFD700" : "#DDDDDD", fontSize: 16 }} />
            ))}
        </Box>
    );
};

const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
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
            </Box>

            <Stack sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="medium" noWrap>
                    {restaurant.restaurantName}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent:'space-between' }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {restaurant.rating && renderRatingStars(restaurant.rating)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {restaurant.reviews}
                        </Typography>
                    </Box>

                    {restaurant.distanceInKm && restaurant.distanceInKm.toFixed(1)} km
                </Box>

                <Button fullWidth variant="outlined" sx={{ py: 1 }}>
                    View Restaurant
                </Button>
            </Stack>
        </Paper>
    );
};

export default RestaurantCard;
