import React from 'react';
import {
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Ingredient, Restaurant } from '../../types';
import RemoveIcon from "@mui/icons-material/Remove";

interface RemoveIngredientsDialogProps {
    open: boolean;
    onClose: () => void;
    onAddToCart: () => void;
    foodName: string;
    foodImage?: string;
    ingredients?: Ingredient[] | undefined;
    restaurant: Restaurant;
    foodDescription: string;
    quantity: number;
    setQuantity: (q: number) => void;
    selectedIngredients: Ingredient[];
    setSelectedIngredients: (ingredients: Ingredient[]) => void;
}

const RemoveIngredientsModal: React.FC<RemoveIngredientsDialogProps> = ({
                                                                            open,
                                                                            onClose,
                                                                            onAddToCart,
                                                                            foodName,
                                                                            foodImage,
                                                                            ingredients,
                                                                            restaurant,
                                                                            foodDescription,
                                                                            quantity,
                                                                            setQuantity,
                                                                            selectedIngredients,
                                                                            setSelectedIngredients
                                                                        }) => {
    // Toggle ingredient selection
    const handleIngredientToggle = (ingredient: Ingredient) => {
        const isSelected = selectedIngredients.some(item => item.id === ingredient.id);
        if (isSelected) {
            setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredient.id));
        } else {
            setSelectedIngredients([...selectedIngredients, ingredient]);
        }
    };

    const handleClose = () => {
        setSelectedIngredients([]);
        onClose();
    };

    const handleAddToCart = () => {
        onAddToCart();
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
        >
            <DialogTitle sx={{ p: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            src={foodImage || undefined}
                            sx={{
                                width: 60,
                                height: 60,
                                mr: 2,
                            }}
                        />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {restaurant.restaurantName || 'Restaurant Name'}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="medium">
                                {foodName || 'Food Name'}
                            </Typography>
                            <Typography color="text.secondary">
                                {foodDescription || 'Food ingredients and contents'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 3 }}>
                {/* Quantity selector */}
                <Box
                    sx={{
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    <IconButton
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        sx={{ border: '1px solid', borderColor: 'grey.300' }}
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>

                    <TextField
                        type="number"
                        label="Quantity"
                        value={quantity}
                        onChange={e => {
                            const val = Number(e.target.value);
                            setQuantity(val < 1 ? 1 : val);
                        }}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: 80 }}
                    />

                    <IconButton
                        onClick={() => setQuantity(quantity + 1)}
                        sx={{ border: '1px solid', borderColor: 'grey.300' }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
                {/* Ingredients Selection Header */}
                {ingredients && ingredients.length > 0 && (
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}
                    >
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                mr: 2,
                                borderRadius: '50%',
                                backgroundColor: 'primary.light',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <RestaurantIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        </Box>

                        <Typography fontWeight="medium">
                            Select Ingredients to Remove
                        </Typography>
                    </Box>
                )}

                {/* Ingredients Grid */}
                <Grid container spacing={2}>
                    {ingredients && ingredients.map((ingredient) => (
                        <Grid key={ingredient.id} size={{xs:12,sm:4}} >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedIngredients.some(item => item.id === ingredient.id)}
                                        onChange={() => handleIngredientToggle(ingredient)}
                                        icon={<RadioButtonUncheckedIcon />}
                                        checkedIcon={<CloseIcon sx={{ color: 'secondary.main' }} />}
                                    />
                                }
                                label={ingredient.name}
                            />
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RemoveIngredientsModal;