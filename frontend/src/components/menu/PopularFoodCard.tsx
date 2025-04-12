import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import RemoveIngredientsModal from "../cart/RemoveIngredientsModal";
import { useEffect, useState } from "react";
import { addToCart, getIngredients } from "../../utils/api";
import { Restaurant } from "../../types";

interface Food {
    id: number;
    name: string;
    image: string;
    restaurant: Restaurant;
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
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

    const fetchIngredients = async (menuItemId: number) => {
        try {
            console.log("[PopularFoodCard] fetching ingredients for", menuItemId);
            const list = await getIngredients(menuItemId);
            console.log("[PopularFoodCard] got ingredients:", list);
            setIngredients(list);
        } catch (err) {
            console.error("[PopularFoodCard] failed to load ingredients for", menuItemId, err);
        }
    };

    const handleOpenModal = async () => {
        // 3) fetch first...
        await fetchIngredients(food.id);
        // 4) ...then open
        console.log("[PopularFoodCard] opening modal");
        setIsModalOpen(true);
    };

    // Handler for adding to cart
    const handleAddToCart = async () => {
        const csv = selectedIngredients.join(',');

        try {
            const res = await addToCart({
                menuItemId: food.id,
                quantity,
                removableElements: csv,
            });

            console.log("Added to cart:", res);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to add to cart", err);
        }
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
                            {food.restaurant.restaurantName}
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

            {isModalOpen && (
                <RemoveIngredientsModal
                    open={true}
                    onClose={() => setIsModalOpen(false)}
                    onAddToCart={handleAddToCart}
                    foodName={food.name}
                    foodImage={food.image}
                    ingredients={ingredients}
                    restaurant={food.restaurant}
                    foodDescription={food.description}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    selectedIngredients={selectedIngredients}
                    setSelectedIngredients={setSelectedIngredients}
                />
            )}
        </>
    );
};

export default PopularFoodCard;
