import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
    Typography,
    Divider,
    Box,
    Grid,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    TextField,
    SelectChangeEvent,
    Button,
    Paper,
    Tooltip
} from '@mui/material';
import { Restaurant } from '../types';
import { getFavoriteRestaurants } from '../utils/api';
import { useTranslation } from 'react-i18next';
import Loading from '../components/Loading';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { Link } from 'react-router-dom';

const RestaurantCard = lazy(() => import('../components/restaurant/RestaurantCart'));

// Constants
const MAX_DELIVERY_DISTANCE = 15; // Maximum delivery distance in km

// Loading fallback
const LoadingFallback = () => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        minHeight: '150px'
    }}>
        <Loading size={60} showText={false} />
    </Box>
);

// Restaurant Card Skeleton 
const RestaurantCardSkeleton = () => (
    <Paper
        elevation={2}
        sx={{
            p: 0,
            borderRadius: 4,
            overflow: 'hidden',
            height: '100%',
            transition: "transform 0.2s",
            "&:hover": {
                transform: "translateY(-5px)",
            },
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        <Box sx={{ height: 160, bgcolor: 'rgba(0, 0, 0, 0.08)' }} />
        <Box sx={{ p: 2 }}>
            <Box sx={{ height: 24, width: '70%', bgcolor: 'rgba(0, 0, 0, 0.08)', mb: 1 }} />
            <Box sx={{ height: 16, width: '40%', bgcolor: 'rgba(0, 0, 0, 0.08)', mb: 1 }} />
            <Box sx={{ height: 16, width: '50%', bgcolor: 'rgba(0, 0, 0, 0.08)', mb: 1.5 }} />
            <Box sx={{ height: 36, width: '100%', bgcolor: 'rgba(0, 0, 0, 0.08)' }} />
        </Box>
    </Paper>
);

const FavoritesPage = () => {
    const { t } = useTranslation();

    const [favorites, setFavorites] = useState<Restaurant[]>([]);
    const [filteredFavorites, setFilteredFavorites] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('distance'); // Default sort by distance

    const refreshFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const list = await getFavoriteRestaurants();

            // Default sort by distance
            const sortedList = [...list].sort((a, b) => (a.distanceInKm || 0) - (b.distanceInKm || 0));

            setFavorites(sortedList);
            setFilteredFavorites(sortedList);
        } catch (err) {
            console.error('Could not load favorites:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshFavorites();
    }, [refreshFavorites]);

    // Handle search
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (!value.trim()) {
            setFilteredFavorites(favorites);
            return;
        }

        // Filter favorites based on search term
        const filtered = favorites.filter(restaurant =>
            restaurant.restaurantName.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredFavorites(filtered);
    };

    // Handle sort
    const handleSortChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setSortOption(value);

        let sorted = [...filteredFavorites];

        if (value === 'rating') {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (value === 'distance') {
            sorted.sort((a, b) => (a.distanceInKm || 0) - (b.distanceInKm || 0));
        } else if (value === 'name') {
            sorted.sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));
        }

        setFilteredFavorites(sorted);
    };

    // Check if restaurant is beyond delivery range
    const isOutOfRange = (restaurant: Restaurant) => {
        return (restaurant.distanceInKm || 0) > MAX_DELIVERY_DISTANCE;
    };

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                }}>
                    <Typography variant="h5" fontWeight={700} mb={1}>
                        {t('favorites.title', 'Favorite Restaurants')}
                    </Typography>

                    <Button
                        component={Link}
                        to="/restaurants"
                        variant="outlined"
                        size="small"
                        sx={{ ml: 1, textTransform: 'none' }}
                    >
                        {t('restaurants.browse')}
                    </Button>
                </Box>
                <Divider sx={{ mt: 2, mb: 3 }} />
            </Box>

            {/* Search and filters */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            fullWidth
                            placeholder={t('favorites.search_placeholder', 'Search favorite restaurants')}
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
                                    borderRadius: 2,
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth size="medium">
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
                                renderValue={(value) => {
                                    if (value === 'rating') return t('search.byRating');
                                    if (value === 'distance') return t('search.byDistance');
                                    if (value === 'name') return t('search.byName', 'A-Z');
                                    return value;
                                }}
                            >
                                <MenuItem value="distance">{t('search.byDistance')}</MenuItem>
                                <MenuItem value="rating">{t('search.byRating')}</MenuItem>
                                <MenuItem value="name">{t('search.byName', 'A-Z')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Content */}
            {isLoading ? (
                // Show loading indicators
                <Grid container spacing={3}>
                    {Array.from(new Array(8)).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`skeleton-${index}`}>
                            <RestaurantCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : filteredFavorites.length > 0 ? (
                // Show favorites
                <Grid container spacing={3}>
                    {filteredFavorites.map((restaurant) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={restaurant.id}>
                            <Suspense fallback={<RestaurantCardSkeleton />}>
                                <RestaurantCard
                                    restaurant={restaurant}
                                    initialFavorite={true}
                                    refreshFavorites={refreshFavorites}
                                    disabled={isOutOfRange(restaurant)}
                                />
                            </Suspense>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                // Show no results message
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            maxWidth: 500,
                            mx: 'auto',
                            borderRadius: 4,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            {searchTerm
                                ? t('favorites.no_search_results')
                                : t('favorites.no_favorites')}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            {searchTerm
                                ? t('favorites.try_different_search')
                                : t('favorites.add_some_favorites')}
                        </Typography>
                        {searchTerm ? (
                            <Button
                                variant="contained"
                                onClick={() => setSearchTerm('')}
                                sx={{ mr: 2 }}
                            >
                                {t('search.clear')}
                            </Button>
                        ) : null}
                        <Button
                            component={Link}
                            to="/restaurants"
                            variant="contained"
                        >
                            {t('restaurants.browse')}
                        </Button>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default FavoritesPage;