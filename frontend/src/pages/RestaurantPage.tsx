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
    useTheme,
    useMediaQuery,
    Skeleton,
    IconButton,
    Tooltip,
    Card,
    CardMedia,
    CardContent
} from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { Search as SearchIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import { getIngredients, getRestaurantMenuForCustomer, getRestaurantDetails } from '../utils/api';
import { MenuItem, Restaurant, Ingredient } from '../types';
import RemoveIngredientsModal from "../components/cart/RemoveIngredientsModal";
import Loading from '../components/Loading';
import { useTranslation } from 'react-i18next';
import FoodImageModal from '../components/menu/FoodImageModal';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
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

    // Toggle favorite status
    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // API to add/remove from favorites
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
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleOpenImageModal = (menuItem: MenuItem, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedFood(menuItem);
        setIsImageModalOpen(true);
    };

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
                {/* Favorite Button */}
                <Tooltip
                    title={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                    arrow
                    placement="bottom-end"
                >
                    <IconButton
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: isFavorite ? 'secondary.main' : 'rgba(255,255,255,0.9)',
                            color: isFavorite ? 'white' : 'secondary.main',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            zIndex: 2,
                            transition: 'all 0.3s ease',
                            width: 48,
                            height: 48,
                            '&:hover': {
                                bgcolor: isFavorite ? 'secondary.dark' : 'white',
                                transform: 'scale(1.1)',
                            },
                        }}
                    >
                        {isFavorite ? <Favorite fontSize="medium" /> : <FavoriteBorder fontSize="medium" />}
                    </IconButton>
                </Tooltip>

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

                    {/* Rating Box - Bottom left of the image */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: { xs: 'auto', md: -40 },
                            right: { xs: -8, md: 'auto' },
                            bottom: { xs: -8, md: -20 },
                            bgcolor: 'background.default',
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
                                    {menuItem.img && (
                                        <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={(e) => handleOpenImageModal(menuItem, e)}
                                        >
                                            <CardMedia
                                                component="img"
                                                src={menuItem.img}
                                                alt={menuItem.name}
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
                                    )}

                                    <CardContent sx={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        px: { xs: 1.5, sm: 2 },
                                    }}>
                                        <Typography
                                            sx={{ mb: 1, fontWeight: 'bold' }}
                                        >
                                            {menuItem.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            {menuItem.description}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color="primary.main"
                                            >
                                                {menuItem.price}₺
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
                                                onClick={() => handleOpenModal(menuItem)}
                                                disabled={isAddingToCart}
                                            >
                                                <AddIcon />
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
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
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedIngredients([]);
                            setQuantity(1);
                        }}
                        foodName={selectedFood.name}
                        foodImage={selectedFood.img || ''}
                        ingredients={ingredients}
                        restaurant={restaurant as Restaurant}
                        foodDescription={selectedFood.description || ''}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        selectedIngredients={selectedIngredients}
                        setSelectedIngredients={setSelectedIngredients}
                        menuItemId={selectedFood.id}
                    />
                )
            }

            {/* Image modal */}
            {selectedFood && <FoodImageModal
                open={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={selectedFood.img}
                foodName={selectedFood.name}
            />}
        </Box >
    );
};

export default RestaurantPage;