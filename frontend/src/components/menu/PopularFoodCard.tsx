import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import RemoveIngredientsModal from "../cart/RemoveIngredientsModal";
import { useEffect, useState } from "react";

interface Food {
    id: number;
    name: string;
    image: string;
    restaurant: string;
    price: string;
    description: string;
}

interface Ingredient {
    id: string;
    name: string;
}

const PopularFoodCard: React.FC<{ food: Food }> = ({ food }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    // Fetch ingredients when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchIngredients();
        }
    }, [isModalOpen, food.id]);

    // Mock function to fetch ingredients from backend
    const fetchIngredients = async () => {
        try {
            // const response = await api.get(`/customer/ingredients/${food.id}`);

            setTimeout(() => {
                // will be replaced with actual API call
                const mockIngredients: Ingredient[] = [
                    { id: 'ing1', name: 'Ingredient 1' },
                    { id: 'ing2', name: 'Ingredient 2' },
                    { id: 'ing3', name: 'Ingredient 3' },
                    { id: 'ing4', name: 'Ingredient 4' },
                    { id: 'ing5', name: 'Ingredient 5' },
                ];

                setIngredients(mockIngredients);
            }, 300);
        } catch (error) {
            // Error handle
        }
    };

    // Handler for opening the modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Handler for adding to cart
    const handleAddToCart = () => {
        console.log(`Added ${food.name} to cart with customizations`);
        setIsModalOpen(false);
        // Add your cart logic here
    };


    return (
        <>
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

                    <Button fullWidth variant="contained" onClick={handleOpenModal}>
                        Add to Cart
                    </Button>
                </Stack>
            </Paper>

            {/* RemoveIngredientsModal Component */}
            <RemoveIngredientsModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={handleAddToCart}
                foodName={food.name}
                foodImage={food.image}
                ingredients={ingredients}
                restaurant={food.restaurant}
                foodDescription={food.description}
            />
        </>
    );
};

export default PopularFoodCard;
