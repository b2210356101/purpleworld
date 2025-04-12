import React, { useState } from 'react';
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

// Type definitions
interface Ingredient {
    id: string;
    name: string;
}

interface RemoveIngredientsDialogProps {
    open: boolean;
    onClose: () => void;
    onAddToCart: () => void;
    foodName: string;
    foodImage?: string;
    ingredients?: Ingredient[] | undefined;
    restaurant: string;
    foodDescription: string;
    quantity: number;
    setQuantity : (q:number) => void;
    selectedIngredients: string[];
    setSelectedIngredients: (ids: string[]) => void;
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
    // State to track selected ingredients to remove

    // Toggle ingredient selection
    const handleIngredientToggle = (ingredientId: string) => {
        if (selectedIngredients.includes(ingredientId)) {
            setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
        } else {
            setSelectedIngredients([...selectedIngredients, ingredientId]);
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
                            src={foodImage || undefined} // will be'placeholder image
                            sx={{
                                width: 60,
                                height: 60,
                                mr: 2,
                            }}
                        />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {restaurant || 'Restaurant Name'}
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
               <Box sx={{ mb: 2 }}>
                 <TextField
                   type="number"
                   label="Quantity"
                   value={quantity}
                   onChange={e => setQuantity(Number(e.target.value))}
                   inputProps={{ min: 1 }}
                   fullWidth
                 />
               </Box>
                {/* Ingredients Selection Header */}
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

                {/* Ingredients Grid */}
                <Grid container spacing={2}>
                    {ingredients && ingredients.map((ingredient) => (
                        <Grid key={ingredient.id} size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedIngredients.includes(ingredient.id)}
                                        onChange={() => handleIngredientToggle(ingredient.id)}
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