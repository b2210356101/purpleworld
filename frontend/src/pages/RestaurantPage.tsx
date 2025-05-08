import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Tabs,
    Tab,
    InputAdornment,
    TextField,
    Button,
    Stack,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    Skeleton
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { Search as SearchIcon, Favorite } from '@mui/icons-material';
import { getIngredients, addToCart, getRestaurantMenuForCustomer, getRestaurantDetails } from '../utils/api';
import { MenuItem, Restaurant, Ingredient, RemovableElementDTO } from '../types';
import RemoveIngredientsModal from "../components/cart/RemoveIngredientsModal";
import Loading from '../components/Loading';
import { useTranslation } from 'react-i18next';

const RestaurantPage = () => {
    const { t } = useTranslation();

    const { id } = useParams<{ id: string }>();
    const restaurantId = id ? parseInt(id) : 0;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading to true when starting to fetch data
            try {
                // Fetch restaurant details
                const restaurantsData = await getRestaurantDetails(restaurantId);

                if (restaurantsData) {
                    setRestaurant(restaurantsData);
                }

                const menuData = await getRestaurantMenuForCustomer(restaurantId);

                if (menuData && menuData.categories) {
                    setCategories(menuData.categories);
                    if (menuData.categories.length > 0) {
                        setMenuItems(menuData.categories[0].menuItems || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching restaurant data:', error);
                setSnackbarMessage('Failed to load restaurant data. Please try again.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            } finally {
                setIsLoading(false); 
            }
        };

        fetchData();
    }, [restaurantId]);

    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        if (categories && categories.length > newValue) {
            setMenuItems(categories[newValue].menuItems || []);
        }
    };

    // Handle search input change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchTerm(searchValue);

        if (!searchValue.trim()) {
            if (categories && categories.length > currentTab) {
                setMenuItems(categories[currentTab].menuItems || []);
            }
            return;
        }

        // Filter items across all categories
        const searchLower = searchValue.toLowerCase();
        const filteredItems: MenuItem[] = [];

        categories.forEach(category => {
            if (category.menuItems) {
                category.menuItems.forEach((item: MenuItem) => {
                    if (
                        item.name.toLowerCase().includes(searchLower) ||
                        (item.description && item.description.toLowerCase().includes(searchLower))
                    ) {
                        filteredItems.push(item);
                    }
                });
            }
        });

        setMenuItems(filteredItems);
    };

    // Fetch ingredients and open modal
    const handleOpenModal = async (menuItem: MenuItem) => {
        setSelectedFood(menuItem);
        setIsAddingToCart(true);

        try {
            // Fetch ingredients
            const ingredientsList = await getIngredients(menuItem.id);
            setIngredients(ingredientsList);

            // Reset states
            setQuantity(1);
            setSelectedIngredients([]);

            // Open modal
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            setSnackbarMessage('Failed to load ingredients. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Add item to cart
    const handleAddToCart = async () => {
        if (!selectedFood) return;

        setIsAddingToCart(true);
        try {
            // Convert selected ingredients to DTO format
            const removableElements: RemovableElementDTO[] = selectedIngredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name
            }));

            // Add to cart
            await addToCart({
                menuItemId: selectedFood.id,
                quantity,
                removableElements
            });

            // Notify other components about cart update
            window.dispatchEvent(new Event("cart-updated"));

            // Close modal and show success message
            setIsModalOpen(false);
            setSnackbarMessage('Item added to cart successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Reset states
            setSelectedFood(null);
            setSelectedIngredients([]);
            setQuantity(1);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setSnackbarMessage('Failed to add item to cart. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // We'll continue rendering the page even while loading

    return (
        <Box sx={{ pb: 6 }}>
            {/* Restaurant Banner */}
            <Paper
                sx={{
                    borderRadius: { xs: 2, sm: 3, md: 4 },
                    overflow: 'hidden',
                    mb: { xs: 2, sm: 3, md: 4 },
                    background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                    color: 'white',
                    position: 'relative',
                    p: { xs: 2, sm: 3 },
                    minHeight: { xs: 280, md: 240 }
                }}
            >
                {/* Add Favorites Button */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        borderBottomRightRadius: { xs: 8, sm: 12, md: 16 },
                        bgcolor: 'rgba(255,255,255,0.9)',
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant={isMobile ? "caption" : "button"}
                        sx={{
                            color: '#FF5E78',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                        }}
                    >
                        {t('restaurant.favorite')} <Favorite fontSize='small' sx={{ ml: 0.5 }} />
                    </Typography>
                </Box>

                <Box sx={{
                    p: { xs: 1, sm: 2, md: 3 },
                    position: 'relative',
                    zIndex: 1,
                    mt: { xs: 3, sm: 4, md: 5 },
                    width: { xs: '100%', md: '55%' }
                }}>
                    <Box sx={{ mb: { xs: 3, sm: 4, md: 6 } }}>
                        {isLoading ? (
                            <Skeleton
                                variant="text"
                                width="70%"
                                height={isMobile ? 40 : isTablet ? 50 : 60}
                                sx={{ mb: { xs: 1, sm: 2 } }}
                            />
                        ) : (
                            <Typography
                                variant={isMobile ? "h4" : isTablet ? "h3" : "h2"}
                                component="h1"
                                fontWeight="bold"
                                sx={{ mb: { xs: 1, sm: 2 } }}
                            >
                                {restaurant?.restaurantName}
                            </Typography>
                        )}

                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 2 },
                            mt: 2
                        }}>
                            {isLoading ? (
                                <>
                                    <Skeleton
                                        variant="rectangular"
                                        width={120}
                                        height={32}
                                        sx={{
                                            borderRadius: 50,
                                            mb: { xs: 1, sm: 0 }
                                        }}
                                    />
                                    <Skeleton
                                        variant="rectangular"
                                        width={150}
                                        height={32}
                                        sx={{
                                            borderRadius: 50
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            borderRadius: 50,
                                            border: '1px solid rgba(255,255,255,0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: { xs: 1.5, sm: 2 },
                                            py: 0.5,
                                        }}
                                    >
                                        <Box sx={{ mr: 1, display: 'flex' }}>₺</Box>
                                        <Typography variant={isMobile ? "caption" : "body2"}>
                                            {t('restaurant.min')}: 250₺
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            borderRadius: 50,
                                            border: '1px solid rgba(255,255,255,0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: { xs: 1.5, sm: 2 },
                                            py: 0.5,
                                        }}
                                    >
                                        <Box sx={{ mr: 1, display: 'flex' }}>🕒</Box>
                                        <Typography variant={isMobile ? "caption" : "body2"}>
                                            {t('restaurant.delivery', { min: 20, max: 25 })}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Image and Rating */}
                <Box
                    sx={{
                        position: { xs: 'relative', md: 'absolute' },
                        right: { md: 24 },
                        top: { md: '50%' },
                        transform: { md: 'translateY(-50%)' },
                        width: { xs: '100%', sm: '60%', md: '40%' },
                        height: { xs: 160, sm: 180, md: '80%' },
                        mx: { xs: 'auto', md: 0 },
                        mt: { xs: 2, md: 0 }
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: { xs: 2, sm: 3, md: 4 },
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                    >
                        {isLoading ? (
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height="100%"
                                animation="wave"
                            />
                        ) : (
                            <Box
                                component="img"
                                src={restaurant?.profileImg}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                alt={restaurant?.restaurantName || "Restaurant image"}
                            />
                        )}
                    </Box>

                    {/* Rating Box - Bottom right of the image */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: { xs: 'auto', md: -40 },
                            right: { xs: -8, md: 'auto' },
                            bottom: { xs: -8, md: -20 },
                            bgcolor: 'white',
                            borderRadius: { xs: 2, md: 3 },
                            width: { xs: 100, sm: 110, md: 125 },
                            p: { xs: 0.5, sm: 1 },
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                    >
                        {isLoading ? (
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={isMobile ? 30 : 40}
                                sx={{ mx: 'auto' }}
                            />
                        ) : (
                            <Typography
                                variant={isMobile ? "h5" : "h4"}
                                fontWeight="bold"
                                color="text.primary"
                            >
                                {restaurant?.rating}
                            </Typography>
                        )}

                        {isLoading ? (
                            <Skeleton
                                variant="text"
                                width="80%"
                                height={20}
                                sx={{ mx: 'auto', my: 0.5 }}
                            />
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                color: '#FFB400',
                                my: 0.5,
                                fontSize: { xs: '0.8rem', md: '1rem' }
                            }}>
                                <Box component="span">★</Box>
                                <Box component="span">★</Box>
                                <Box component="span">★</Box>
                                <Box component="span">★</Box>
                                <Box component="span" sx={{ color: '#E0E0E0' }}>★</Box>
                            </Box>
                        )}

                        {isLoading ? (
                            <Skeleton
                                variant="text"
                                width="90%"
                                height={16}
                                sx={{ mx: 'auto', mb: 0.5 }}
                            />
                        ) : (
                            <Typography
                                variant={isMobile ? "caption" : "body2"}
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                            >
                                {restaurant?.reviews} {t('restaurant.review')}
                            </Typography>
                        )}

                        {isLoading ? (
                            <Skeleton
                                variant="text"
                                width="70%"
                                height={16}
                                sx={{ mx: 'auto' }}
                            />
                        ) : (
                            <Typography
                                variant={isMobile ? "caption" : "body2"}
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 'medium',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                                }}
                            >
                                {t('restaurant.viewReviews')} <Box component="span" sx={{ ml: 0.5 }}>›</Box>
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder={t('restaurant.search')}
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 6,
                            bgcolor: 'primary.light',
                        }
                    }}
                />
            </Box>


            {/* Menu Categories Tabs */}
            {isLoading ? (
                <Box sx={{ mb: 4 }}>
                    <Skeleton
                        variant="rectangular"
                        height={48}
                        sx={{
                            borderRadius: 4,
                            width: '100%'
                        }}
                        animation="wave"
                    />
                </Box>
            ) : (
                categories.length > 0 && !searchTerm && (
                    <Box sx={{ mb: 4 }}>
                        <Paper
                            sx={{
                                borderRadius: 4,
                                bgcolor: 'primary.light',
                            }}
                        >
                            <Tabs
                                value={currentTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                            >
                                {categories.map((category) => (
                                    <Tab
                                        key={category.id}
                                        label={category.name}
                                        id={`menu-tab-${category.id}`}
                                        aria-controls={`menu-tabpanel-${category.id}`}
                                    />
                                ))}
                            </Tabs>
                        </Paper>
                    </Box>
                )
            )}

            {/* Menu Items Grid */}
            <Box>
                {searchTerm && (
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('restaurant.result')}
                    </Typography>
                )}

                {isLoading ? (
                    // Show loading component for menu items
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 10
                    }}>
                        <Loading size={80} />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {menuItems.map((menuItem) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={menuItem.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 4,
                                        bgcolor: 'primary.light',
                                        height: '100%',
                                        transition: "transform 0.3s",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                        },
                                    }}
                                >
                                    {menuItem.img && (
                                        <Box
                                            component="img"
                                            src={menuItem.img}
                                            alt={menuItem.name}
                                            sx={{
                                                width: "100%",
                                                height: 160,
                                                borderTopLeftRadius: 16,
                                                borderTopRightRadius: 16,
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}

                                    <Stack gap={1} sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" noWrap>
                                            {menuItem.name}
                                        </Typography>

                                        {menuItem.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {menuItem.description}
                                            </Typography>
                                        )}

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mt: 1
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 600 }} color="secondary.main" variant="h6">
                                                {menuItem.price}₺
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                onClick={() => handleOpenModal(menuItem)}
                                                disabled={isAddingToCart}
                                                sx={{
                                                    borderRadius: 8,
                                                    px: 2
                                                }}
                                            >
                                                {t('restaurant.add')}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {!isLoading && menuItems.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary">
                            No items found. Try a different search term or category.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Ingredients Modal */}
            {
                isModalOpen && selectedFood && (
                    <RemoveIngredientsModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddToCart={handleAddToCart}
                        foodName={selectedFood.name}
                        foodImage={selectedFood.img || ''}
                        ingredients={ingredients}
                        restaurant={restaurant as Restaurant}
                        foodDescription={selectedFood.description || ''}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        selectedIngredients={selectedIngredients}
                        setSelectedIngredients={setSelectedIngredients}
                    />
                )
            }

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box >
    );
};

export default RestaurantPage;