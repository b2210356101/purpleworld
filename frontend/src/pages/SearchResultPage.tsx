import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    FormControl,
    MenuItem,
    Select,
    InputAdornment,
    SelectChangeEvent,
    Card,
    CardMedia,
    CardContent,
    Collapse,
    TextField,
    Divider,
    Rating,
    Stack,
    useMediaQuery,
    useTheme,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import RemoveIngredientsModal from '../components/cart/RemoveIngredientsModal';
import { getIngredients, searchRestaurants } from '../utils/api';
import { Restaurant, Ingredient, SearchResult } from '../types';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import FoodImageModal from '../components/menu/FoodImageModal';
import Loading from '../components/Loading';

interface Food {
    id: number;
    name: string;
    img?: string; // Backend uses 'img' property
    price: number | string;
    description: string;
    restaurant?: Restaurant;
}

// Restaurant with foods
interface RestaurantWithFoods {
    restaurant: Restaurant;
    matchingFoods: Food[];
}

const SearchResultsPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const params = useParams<{ categoryName?: string }>();

    // Responsive breakpoints
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Get search query from URL or category parameter
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q') || '';
    const categoryParam = params.categoryName || '';

    // Determine the actual search query
    const effectiveQuery = categoryParam || queryParam;

    // State for filtering and sorting
    const [sortOption, setSortOption] = useState('rating');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedRestaurants, setExpandedRestaurants] = useState<Record<number, boolean>>({});
    const [searchText, setSearchText] = useState(effectiveQuery);
    const [isLoading, setIsLoading] = useState(false);

    // Search results
    const [restaurantsWithFoods, setRestaurantsWithFoods] = useState<RestaurantWithFoods[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
    const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [favorites, setFavorites] = useState<Record<number, boolean>>({});
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Update search text when URL or category changes
    useEffect(() => {
        setSearchText(effectiveQuery);
        if (effectiveQuery) {
            fetchSearchResults(effectiveQuery);
        }
    }, [effectiveQuery]);

    // Fetch search results
    const fetchSearchResults = async (query: string) => {
        setIsLoading(true);
        try {
            const results = await searchRestaurants(query);

            // Transform API results to match component structure
            const transformedResults = results.map(result => ({
                restaurant: {
                    id: result.restaurantId,
                    restaurantName: result.restaurantName,
                    distanceInKm: result.distanceInKm >= 0 ? result.distanceInKm : 0,
                    profileImg: result.profileImg,
                    rating: result.rating || 0,
                    reviews: result.reviews || 0
                },
                matchingFoods: result.matchedItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    description: item.description || '',
                    image: item.img, // Using img as image
                    img: item.img
                }))
            }));

            setRestaurantsWithFoods(transformedResults);

            // Initialize expanded state for each restaurant
            const expandedState: Record<number, boolean> = {};
            transformedResults.forEach(item => {
                expandedState[item.restaurant.id] = false; // Start collapsed
            });
            setExpandedRestaurants(expandedState);

            // Initialize favorites state
            const favState: Record<number, boolean> = {};
            transformedResults.forEach(item => {
                favState[item.restaurant.id] = false; // Initialize all as not favorite
            });
            setFavorites(favState);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sorting change
    const handleSortChange = (event: SelectChangeEvent) => {
        setSortOption(event.target.value);

        // Sort logic implementation
        let sortedResults = [...restaurantsWithFoods];

        if (event.target.value === 'rating') {
            sortedResults.sort((a, b) => b.restaurant.rating - a.restaurant.rating);
        } else if (event.target.value === 'distance') {
            sortedResults.sort((a, b) => a.restaurant.distanceInKm - b.restaurant.distanceInKm);
        } else if (event.target.value === 'name') {
            sortedResults.sort((a, b) => a.restaurant.restaurantName.localeCompare(b.restaurant.restaurantName));
        }

        setRestaurantsWithFoods(sortedResults);
    };

    // Toggle expanded state for a restaurant
    const toggleRestaurantExpand = (restaurantId: number) => {
        setExpandedRestaurants(prev => ({
            ...prev,
            [restaurantId]: !prev[restaurantId]
        }));
    };

    // Handle search submission
    const handleSearch = () => {
        if (categoryParam) {
            navigate(`/category/${encodeURIComponent(searchText)}`);
        } else {
            navigate(`/search?q=${encodeURIComponent(searchText)}`);
        }
    };

    // Fetch ingredients and open modal
    const fetchIngredientsForFood = async (menuItemId: number) => {
        try {
            console.log("[SearchResults] fetching ingredients for", menuItemId);
            const list = await getIngredients(menuItemId);
            console.log("[SearchResults] got ingredients:", list);
            setIngredients(list);
            return list;
        } catch (err) {
            console.error("[SearchResults] failed to load ingredients for", menuItemId, err);
            // For error handling, return empty array
            return [];
        }
    };

    // Handle opening the modal
    const handleOpenModal = async (food: Food, restaurant: Restaurant) => {
        setIsLoadingIngredients(true);
        setSelectedFood(food);
        setSelectedRestaurant(restaurant);

        try {
            // Reset modal state
            setQuantity(1);
            setSelectedIngredients([]);

            // Fetch ingredients first
            const ingredientsList = await fetchIngredientsForFood(food.id);
            setIngredients(ingredientsList);

            // Then open modal
            console.log("[SearchResults] opening modal for", food.name);
            setIsModalOpen(true);
        } catch (error) {
            console.error("[SearchResults] Error opening modal:", error);
        } finally {
            setIsLoadingIngredients(false);
        }
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIngredients([]);
        setQuantity(1);
        setSelectedFood(null);
        setSelectedRestaurant(null);
    };

    const getCategoryDisplayName = (categoryName: string): string => {
        const translatedCategory = t(`homepage.categories.${categoryName}`);

        if (translatedCategory === `homepage.categories.${categoryName}`) {
            return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        }

        return translatedCategory;
    };

    const toggleFavorite = (restaurantId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setFavorites(prev => ({
            ...prev,
            [restaurantId]: !prev[restaurantId]
        }));
        // API to add/remove from favorites
        // TODO: Implement favorite API call
    };

    const handleOpenImageModal = (food: Food, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedFood(food);
        setIsImageModalOpen(true);
    };

    return (
        <>
            {/* Search Hero Section */}
            <Paper
                sx={{
                    borderRadius: { xs: 2, sm: 3, md: 4 },
                    overflow: 'hidden',
                    mb: { xs: 2, sm: 3, md: 4 },
                    background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                    color: 'white',
                    position: 'relative',
                    p: { xs: 2, sm: 3 },
                    minHeight: { xs: 'auto', md: 220 },
                    alignContent: 'center'
                }}
            >
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {categoryParam
                        ? t('homepage.category.title', { category: getCategoryDisplayName(categoryParam) })
                        : t('search.results')}
                </Typography>

                {!categoryParam &&
                    <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        "{effectiveQuery}"
                    </Typography>
                }

                {!categoryParam && (
                    <Box
                        component="form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch();
                        }}
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 1, sm: 1 },
                            mt: 2
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={t('search.placeholder')}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                },
                                '& .MuiInputBase-input': {
                                    color: (theme) => theme.palette.text.primary,
                                },
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(33, 33, 33, 0.9)'
                                        : 'rgba(255, 255, 255, 0.9)',
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="inherit" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(33, 33, 33, 0.6)'
                                        : 'rgba(255, 255, 255, 0.15)',
                                '&:hover': {
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(33, 33, 33, 0.8)'
                                            : 'rgba(255, 255, 255, 0.25)',
                                },
                                minWidth: { xs: '100%', sm: 'auto' },
                                mt: { xs: 1, sm: 0 }
                            }}
                        >
                            {t('search.button')}
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Filter and Sort Area */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 3
            }}>
                <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                    <Typography variant="h6" color="text.secondary">
                        {restaurantsWithFoods.length} {t('search.resultsFound')}
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    width: { xs: '100%', sm: 'auto' },
                    gap: 2
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterAltIcon />}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        sx={{
                            borderRadius: 2,
                            width: { xs: '100%', sm: 'auto' },
                            minHeight: 40
                        }}
                    >
                        {t('search.filter')}
                    </Button>

                    <FormControl sx={{ width: { xs: '100%', sm: 220 }, minHeight: 40 }} size="small">
                        <Select
                            value={sortOption}
                            onChange={handleSortChange}
                            displayEmpty
                            startAdornment={
                                <InputAdornment position="start">
                                    <SortIcon fontSize="small" />
                                </InputAdornment>
                            }
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="rating">{t('search.byRating')}</MenuItem>
                            <MenuItem value="distance">{t('search.byDistance')}</MenuItem>
                            <MenuItem value="name">{t('search.byName')}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Filter Panel (Collapsed) */}
            <Collapse in={isFilterOpen}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('search.filterOptions')}
                    </Typography>

                    <Grid container spacing={2}>
                        {/* Filter options would go here */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {t('search.cuisine')}
                            </Typography>
                            {/* Cuisine filters */}
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {t('search.price')}
                            </Typography>
                            {/* Price filters */}
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {t('search.distance')}
                            </Typography>
                            {/* Distance filters */}
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            {t('search.applyFilters')}
                        </Button>
                    </Box>
                </Paper>
            </Collapse>

            {isLoading && (
                <Loading />
            )}

            {/* Restaurant Results */}
            {!isLoading && restaurantsWithFoods.length > 0 ? (
                restaurantsWithFoods.map((item) => (
                    <Paper
                        key={item.restaurant.id}
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.4)',
                            }
                        }}
                    >
                        {/* Restaurant Header */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            position: 'relative'
                        }}>
                            {/* Restaurant Image */}
                            <Box
                                sx={{
                                    width: { xs: '100%', sm: 140 },
                                    height: { xs: 160, sm: 'auto' },
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    borderRadius: {
                                        xs: '8px 8px 0 0',
                                        sm: '0 0 0 8px'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={item.restaurant.profileImg}
                                    alt={item.restaurant.restaurantName}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* Favorite Button */}
                                <Tooltip
                                    title={favorites[item.restaurant.id] ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                                    arrow
                                    placement="top"
                                >
                                    <IconButton
                                        onClick={(e) => toggleFavorite(item.restaurant.id, e)}
                                        aria-label={favorites[item.restaurant.id] ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            bgcolor: favorites[item.restaurant.id] ? 'secondary.main' : 'rgba(255,255,255,0.9)',
                                            color: favorites[item.restaurant.id] ? 'white' : 'secondary.main',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                            zIndex: 2,
                                            transition: 'all 0.2s ease',
                                            width: 36,
                                            height: 36,
                                            '&:hover': {
                                                bgcolor: favorites[item.restaurant.id] ? 'secondary.dark' : 'white',
                                                transform: 'scale(1.1)',
                                            },
                                        }}
                                    >
                                        {favorites[item.restaurant.id] ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Restaurant Info */}
                            <Box sx={{
                                p: { xs: 2, sm: 3 },
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <Box>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'space-between',
                                        alignItems: { xs: 'flex-start', sm: 'flex-start' }
                                    }}>
                                        <Typography
                                            variant={isMobile ? "h6" : "h5"}
                                            fontWeight="bold"
                                            sx={{ mb: { xs: 1, sm: 0 } }}
                                        >
                                            {item.restaurant.restaurantName}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: { xs: 1, sm: 0 }
                                        }}>
                                            <FastfoodIcon sx={{ mr: 0.5, color: 'primary.main', fontSize: 16 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {item.matchingFoods.length} {t('search.matchingItems')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'space-between',
                                        alignItems: { xs: 'flex-start', sm: 'flex-end' },
                                        mt: 1
                                    }}>
                                        <Stack sx={{ mb: { xs: 2, sm: 0 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Rating
                                                    value={item.restaurant.rating}
                                                    precision={0.5}
                                                    readOnly
                                                    size="small"
                                                />
                                                <Typography variant="body2" sx={{ ml: 1 }}>
                                                    ({item.restaurant.rating}) - {item.restaurant.reviews} {t('reviews')}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.restaurant.distanceInKm} km
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 1, sm: 1 },
                                            width: { xs: '100%', sm: 'auto' }
                                        }}>
                                            <Button
                                                component={Link}
                                                to={`/restaurants/${item.restaurant.id}`}
                                                variant="outlined"
                                                size="small"
                                            >
                                                {t('restaurant.view')}
                                            </Button>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={expandedRestaurants[item.restaurant.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                onClick={() => toggleRestaurantExpand(item.restaurant.id)}
                                            >
                                                {expandedRestaurants[item.restaurant.id] ? t('search.hide') : t('search.showItems')}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Matching Food Items */}
                        <Collapse in={expandedRestaurants[item.restaurant.id]}>
                            <Divider />
                            <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: 'rgba(0, 0, 0, 0.01)' }}>
                                <Grid container spacing={2}>
                                    {item.matchingFoods.map((food) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={food.id}>
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
                                                <Box
                                                    sx={{ position: 'relative', cursor: 'pointer' }}
                                                    onClick={(e) => handleOpenImageModal(food, e)}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        height="180"
                                                        image={food.img}
                                                        alt={food.name}
                                                        sx={{
                                                            objectFit: 'cover',
                                                            borderRadius: 4,
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
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        {food.description}
                                                    </Typography>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mt: 'auto'
                                                    }}>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            color="primary.main"
                                                        >
                                                            {food.price}₺
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
                                                            onClick={() => handleOpenModal(food, item.restaurant)}
                                                            disabled={isLoadingIngredients}
                                                        >
                                                            <AddIcon />
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Collapse>
                    </Paper>
                ))
            ) : !isLoading && (
                /* No Results Message */
                <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', borderRadius: 3, my: 4 }}>
                    <Box sx={{
                        maxWidth: 400,
                        mx: 'auto',
                        py: { xs: 2, sm: 3 }
                    }}>
                        <SearchIcon sx={{ fontSize: { xs: 40, sm: 60 }, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            {t('search.noResults')}
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: { xs: 3, sm: 4 } }}
                        >
                            {t('search.tryDifferent')}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/')}
                        >
                            {t('search.backToHome')}
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Remove Ingredients Modal */}
            {isModalOpen && selectedFood && selectedRestaurant && (
                <RemoveIngredientsModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    foodName={selectedFood.name}
                    foodImage={selectedFood.img || selectedFood.img || ''}
                    ingredients={ingredients}
                    restaurant={selectedRestaurant}
                    foodDescription={selectedFood.description}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    selectedIngredients={selectedIngredients}
                    setSelectedIngredients={setSelectedIngredients}
                    menuItemId={selectedFood.id}
                />
            )}

            {/* Image modal */}
            {selectedFood && selectedFood.img && <FoodImageModal
                open={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={selectedFood.img}
                foodName={selectedFood.name}
            />}
        </>
    );
};

export default SearchResultsPage;