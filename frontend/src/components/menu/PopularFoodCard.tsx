import { Box, Typography, Button, Card, CardMedia, CardContent } from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import AddIcon from '@mui/icons-material/Add';
import RemoveIngredientsModal from "../cart/RemoveIngredientsModal";
import { useState } from "react";
import { getIngredients } from "../../utils/api";
import { Ingredient, Restaurant } from "../../types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FoodImageModal from "./FoodImageModal";

interface Food {
    id: number;
    name: string;
    image: string;
    restaurant: Restaurant;
    price: string;
    description: string;
}

const PopularFoodCard: React.FC<{ food: Food }> = ({ food }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
        setIsLoading(true);
        try {
            // Fetch ingredients first
            await fetchIngredients(food.id);
            // Then open modal
            console.log("[PopularFoodCard] opening modal");
            setIsModalOpen(true);
        } catch (error) {
            console.error("[PopularFoodCard] Error opening modal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenImageModal = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsImageModalOpen(true);
    };

    return (
        <>
            <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.4)',
                },
            }}>
                <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={handleOpenImageModal}>
                    <CardMedia
                        component="img"
                        src={food.image}
                        alt={food.name}
                        sx={{
                            width: "100%",
                            borderRadius: 4,
                            aspectRatio: "1",
                            objectFit: "cover",
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.03)',
                            }
                        }}
                    />
                </Box>

                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    px: { xs: 1.5, sm: 2 },
                }}>
                    <Typography
                        sx={{ mb: 1, fontWeight: 'bold' }}
                    >
                        {food.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <LocationOn sx={{ color: "secondary.main", fontSize: 16, mr: 0.5 }} />
                        <Typography component={Link} to={`/restaurants/${food.restaurant.id}`} variant="body2" color="text.secondary" sx={{ textDecoration: 'none', }} noWrap>
                            {food.restaurant.restaurantName}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="primary.main"
                        >
                            {food.price}
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{
                                minWidth: 0,
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                borderRadius: '50%',
                                p: 0
                            }}
                            onClick={handleOpenModal}
                            disabled={isLoading}
                        >
                            <AddIcon />
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {isModalOpen && (
                <RemoveIngredientsModal
                    open={true}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedIngredients([]);
                        setQuantity(1);
                    }}
                    foodName={food.name}
                    foodImage={food.image}
                    ingredients={ingredients}
                    restaurant={food.restaurant}
                    foodDescription={food.description}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    selectedIngredients={selectedIngredients}
                    setSelectedIngredients={setSelectedIngredients}
                    menuItemId={food.id}
                />
            )}

            {/* Image modal */}
            <FoodImageModal
                open={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={food.image}
                foodName={food.name}
            />
        </>
    );
};

export default PopularFoodCard;