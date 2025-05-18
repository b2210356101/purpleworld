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
    Pagination
} from '@mui/material';
import { Restaurant, PageInfo, PageResponse } from '../types';
import { getNearestRestaurants } from '../utils/api';
import { useAddress } from '../hooks/useAddress';
import { useTranslation } from 'react-i18next';
import Loading from '../components/Loading';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

// Lazy loaded components
const RestaurantCard = lazy(() => import('../components/restaurant/RestaurantCart'));
const AddressDialog = lazy(() => import('../components/customer/AddressDialog'));
const AddAddressModal = lazy(() => import('../components/address/AddAddressModal'));
const ConfirmDialog = lazy(() => import('../components/customer/ConfirmDialog'));
const AddressSection = lazy(() => import('../components/customer/AddressSection'));

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

const RestaurantsPage = () => {
    const { t } = useTranslation();
    const address = useAddress();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('rating');

    // Pagination state
    const [page, setPage] = useState(0);
    const [pageSize] = useState(16);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

    // Fetch restaurants based on selected address with pagination
    const loadRestaurants = useCallback(async (pageNum = 0) => {
        if (!address.selectedAddress) return;

        setIsLoading(true);
        try {
            const result = await getNearestRestaurants(pageNum, pageSize);

            setRestaurants(result.content);
            setFilteredRestaurants(result.content);
            setPageInfo(result.pageInfo);

        } catch (err) {
            console.error('Could not load restaurants:', err);
        } finally {
            setIsLoading(false);
        }
    }, [address.selectedAddress, pageSize]);

    // Load restaurants when selected address or page changes
    useEffect(() => {
        if (address.selectedAddress) {
            loadRestaurants(page);
        }
    }, [address.selectedAddress, page, loadRestaurants]);

    // Handle page change
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); // MUI Pagination uses 1-based indexing, our API uses 0-based
        window.scrollTo(0, 0); // Scroll to top when page changes
    };

    // Handle search - this filters the current page results only
    // For a real-world app, you'd send the search term to the backend
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (!value.trim()) {
            setFilteredRestaurants(restaurants);
            return;
        }

        // Filter restaurants based on search term
        const filtered = restaurants.filter(restaurant =>
            restaurant.restaurantName.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredRestaurants(filtered);
    };

    // Handle sort - applies to current page only
    const handleSortChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setSortOption(value);

        let sorted = [...filteredRestaurants];

        if (value === 'rating') {
            sorted.sort((a, b) => b.rating - a.rating);
        } else if (value === 'distance') {
            sorted.sort((a, b) => a.distanceInKm - b.distanceInKm);
        } else if (value === 'name') {
            sorted.sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));
        }

        setFilteredRestaurants(sorted);
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
                        {t('restaurants.title', 'Restaurants')}
                    </Typography>

                    {address.selectedAddress && <Button
                        variant='contained'
                        size="small"
                        sx={{ ml: 1, textTransform: 'none' }}
                        onClick={address.handleDialogOpen}
                    >
                        {t('address.change')}
                    </Button>}
                </Box>
                <Divider sx={{ mt: 2, mb: 3 }} />
            </Box>

            {/* Search and filters */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            fullWidth
                            placeholder={t('restaurants.search_placeholder')}
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
                                <MenuItem value="rating">{t('search.byRating')}</MenuItem>
                                <MenuItem value="distance">{t('search.byDistance')}</MenuItem>
                                <MenuItem value="name">{t('search.byName', 'A-Z')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Conditional content based on address selection */}
            {!address.selectedAddress ? (
                <Suspense fallback={<LoadingFallback />}>
                    <AddressSection
                        selectedAddress={address.selectedAddress}
                        handleDialogOpen={address.handleDialogOpen}
                    />
                </Suspense>
            ) : isLoading ? (
                // Show loading indicators
                <Grid container spacing={3}>
                    {Array.from(new Array(12)).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`skeleton-${index}`}>
                            <RestaurantCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : filteredRestaurants.length > 0 ? (
                <>
                    {/* Show restaurants */}
                    <Grid container spacing={3}>
                        {filteredRestaurants.map((restaurant) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={restaurant.id}>
                                <Suspense fallback={<RestaurantCardSkeleton />}>
                                    <RestaurantCard restaurant={restaurant} />
                                </Suspense>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {pageInfo && pageInfo.totalPages > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                            <Pagination
                                count={pageInfo.totalPages}
                                page={page + 1} // MUI Pagination uses 1-based indexing
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: '1rem',
                                    }
                                }}
                            />
                        </Box>
                    )}
                </>
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
                                ? t('restaurants.no_search_results')
                                : t('restaurants.no_restaurants')}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            {searchTerm
                                ? t('restaurants.try_different_search')
                                : t('restaurants.try_different_address')}
                        </Typography>
                        {searchTerm ? (
                            <Button
                                variant="contained"
                                onClick={() => setSearchTerm('')}
                            >
                                {t('search.clear')}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={address.handleDialogOpen}
                            >
                                {t('address.change')}
                            </Button>
                        )}
                    </Paper>
                </Box>
            )}

            {/* Dialogs - Only render when needed */}
            {address.isAddressDialogOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <AddressDialog
                        open={address.isAddressDialogOpen}
                        onClose={address.handleDialogClose}
                        addresses={address.addresses}
                        selectedAddress={address.selectedAddress}
                        pendingAddressId={address.pendingAddressId}
                        handleAddressChange={address.handleAddressChange}
                        handleSaveAddresses={address.handleSaveAddresses}
                        handleAddNewAddress={address.handleAddNewAddress}
                        handleEditAddress={address.handleEditAddress}
                        handleDeleteAddress={address.handleDeleteAddress}
                        error={address.error}
                    />
                </Suspense>
            )}

            {address.isNewAddressDialogOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <AddAddressModal
                        open={address.isNewAddressDialogOpen}
                        onClose={() => {
                            address.setIsNewAddressDialogOpen(false);
                            address.isEditMode = false;
                            address.setAddressToEdit(null);
                        }}
                        onSave={address.isEditMode ? address.handleUpdateAddress : address.handleSaveNewAddress}
                        isEditMode={address.isEditMode}
                        addressData={address.addressToEdit}
                    />
                </Suspense>
            )}

            {address.isConfirmDialogOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <ConfirmDialog
                        open={address.isConfirmDialogOpen}
                        onClose={() => address.setIsConfirmDialogOpen(false)}
                        onConfirm={() => {
                            address.setIsConfirmDialogOpen(false);
                            address.onConfirmProceed?.();
                        }}
                        title={t('address.change')}
                        message={t('address.removeItems')}
                        confirmText={t('util.yes')}
                        cancelText={t('util.cancel')}
                    />
                </Suspense>
            )}
        </Box>
    );
};

export default RestaurantsPage;