import React, { useState, useEffect } from 'react';
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
    TextField,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Ingredient, Restaurant, RemovableElementDTO } from '../../types';
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../store/hooks';
import { addToCartAsync } from '../../store/slices/cartSlice';

interface RemoveIngredientsDialogProps {
    open: boolean;
    onClose: () => void;
    foodName: string;
    foodImage?: string;
    ingredients?: Ingredient[] | undefined;
    restaurant: Restaurant;
    foodDescription: string;
    quantity: number;
    setQuantity: (q: number) => void;
    selectedIngredients: Ingredient[];
    setSelectedIngredients: (ingredients: Ingredient[]) => void;
    menuItemId: number;
}

const RemoveIngredientsModal: React.FC<RemoveIngredientsDialogProps> = ({
    open,
    onClose,
    foodName,
    foodImage,
    ingredients,
    restaurant,
    foodDescription,
    quantity,
    setQuantity,
    selectedIngredients,
    setSelectedIngredients,
    menuItemId
}) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [animating, setAnimating] = useState(false);
    const [animationPosition, setAnimationPosition] = useState({ top: 0, left: 0 });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [dialogOpen, setDialogOpen] = useState(open);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Toggle ingredient selection
    const handleIngredientToggle = (ingredient: Ingredient) => {
        const isSelected = selectedIngredients.some(item => item.id === ingredient.id);
        if (isSelected) {
            setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredient.id));
        } else {
            setSelectedIngredients([...selectedIngredients, ingredient]);
        }
    };

    // ai-gen start (claude)
    const handleClose = () => {
        if (animating) return;
        
        setDialogOpen(false);
        setTimeout(() => {
            setSelectedIngredients([]);
            onClose();
        }, 300);
    };

    const getCartPosition = () => {
        // Cart icon
        const cartButton = document.querySelector('[data-testid="ShoppingCartIcon"]');
        
        if (cartButton) {
            const rect = cartButton.getBoundingClientRect();
            return {
                top: rect.top + rect.height / 2,
                left: rect.left + rect.width / 2
            };
        }
        
        return {
            top: 45,
            left: window.innerWidth - 40
        };
    };

    const animateToCart = async () => {
        setAnimating(true);
        
        setDialogOpen(false);
        
        const startPosition = {
            top: mousePosition.y,
            left: mousePosition.x
        };
        
        const endPosition = getCartPosition();
        
        setAnimationPosition(startPosition);
        
        const startTime = performance.now();
        const duration = 800; // ms

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOutProgress = 1 - Math.pow(1 - progress, 3); 
            
            // Current position
            const currentTop = startPosition.top + (endPosition.top - startPosition.top) * easeOutProgress;
            const currentLeft = startPosition.left + (endPosition.left - startPosition.left) * easeOutProgress;
            
            // Scale and opacity based on progress
            const scale = 1 - (0.6 * easeOutProgress);
            
            setAnimationPosition({ top: currentTop, left: currentLeft });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    setAnimating(false);
                    setTimeout(() => {
                        onClose();
                    }, 100);
                }, 200);
            }
        };

        requestAnimationFrame(animate);
    };
    // ai-gen end

    const handleAddToCart = async () => {
        setIsLoading(true);
        try {
            // Convert selected ingredients to the expected DTO format
            const removableElements: RemovableElementDTO[] = selectedIngredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name
            }));

            // Redux action
            await dispatch(addToCartAsync({
                menuItemId,
                quantity,
                removableElements
            })).unwrap();

            setIsLoading(false);
            animateToCart();

        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setDialogOpen(open);
    }, [open]);

    return (
        <>
            <Dialog
                open={dialogOpen}
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
                            disabled={animating}
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
                            label={t('restaurant.quantity')}
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
                                {t('restaurant.selectRemove')}
                            </Typography>
                        </Box>
                    )}

                    {/* Ingredients Grid */}
                    <Grid container spacing={2}>
                        {ingredients && ingredients.map((ingredient) => (
                            <Grid key={ingredient.id} size={{ xs: 12, sm: 4 }} >
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
                        disabled={isLoading}
                    >
                        {t('util.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
                        onClick={handleAddToCart}
                        disabled={isLoading}
                    >
                        {t('restaurant.add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Animation, ai-gen start (claude) */}
            {animating && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 9999,
                        pointerEvents: 'none'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: animationPosition.top,
                            left: animationPosition.left,
                            transform: 'translate(-50%, -50%) scale(0.8)',
                            zIndex: 10000,
                            transition: 'transform 0.3s ease-out',
                            animation: 'pulse 0.5s ease-in-out infinite alternate',
                            '@keyframes pulse': {
                                '0%': {
                                    transform: 'translate(-50%, -50%) scale(0.8)',
                                    boxShadow: '0 0 0 0 rgba(0,0,0,0.2)'
                                },
                                '100%': {
                                    transform: 'translate(-50%, -50%) scale(0.9)',
                                    boxShadow: '0 0 0 10px rgba(0,0,0,0)'
                                }
                            }
                        }}
                    >
                        <Avatar
                            src={foodImage || undefined}
                            sx={{
                                width: 50,
                                height: 50,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        />
                    </Box>
                </Box>
            )}
            {/* ai-gen end */}
        </>
    );
};

export default RemoveIngredientsModal;