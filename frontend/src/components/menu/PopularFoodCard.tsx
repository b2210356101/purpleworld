import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";

interface Food {
    id: number;
    name: string;
    image: string;
    restaurant: string;
    price: string;
}

const PopularFoodCard: React.FC<{ food: Food }> = ({ food }) => {
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
            <Box
                component="img"
                src={food.image}
                alt={food.name}
                sx={{
                    width: "100%",
                    borderRadius: 4,
                    aspectRatio: "1",
                    objectFit: "cover",
                }}
            />

            <Stack gap={1} sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="medium" noWrap>
                    {food.name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocationOn sx={{ color: "secondary.main", fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {food.restaurant}
                    </Typography>
                </Box>

                <Typography sx={{ fontWeight: 600 }} color="secondary.main">
                    {food.price}
                </Typography>

                <Button fullWidth variant="contained">
                    Add to Cart
                </Button>
            </Stack>
        </Paper>
    );
};

export default PopularFoodCard;
