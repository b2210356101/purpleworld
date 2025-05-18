import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Box, Typography, Button, Grid, Paper, Snackbar, Alert, Skeleton } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAddress } from '../hooks/useAddress';
import { useOrders } from '../hooks/useOrders';
import { useTracking } from '../hooks/useTracking';
import { Restaurant, CustomerCurrentOrderDTO, Food } from '../types';
import { getNearestRestaurants, getPopularMenuItems } from '../utils/api';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import Loading from '../components/Loading';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCartCountAsync } from '../store/slices/cartSlice';

// Lazy-loaded components
const AddAddressModal = lazy(() => import('../components/address/AddAddressModal'));
const AddressDialog = lazy(() => import('../components/customer/AddressDialog'));
const AddressSection = lazy(() => import('../components/customer/AddressSection'));
const CancelOrderDialog = lazy(() => import('../components/customer/CancelOrderDialog'));
const ConfirmDialog = lazy(() => import('../components/customer/ConfirmDialog'));
const OrderTracking = lazy(() => import('../components/customer/OrderTracking'));
const TrackingDialog = lazy(() => import('../components/customer/TrackingDialog'));
const FoodCategories = lazy(() => import('../components/menu/FoodCategories'));
const PopularFoodCard = lazy(() => import('../components/menu/PopularFoodCard'));
const OrderDetailsModal = lazy(() => import('../components/OrderDetailsModal'));
const PaymentSuccessPopup = lazy(() => import('../components/PaymentSuccessPopUp'));
const RestaurantCard = lazy(() => import('../components/restaurant/RestaurantCart'));

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
export const RestaurantCardSkeleton = () => (
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
        <Skeleton variant="rectangular" height={160} animation="wave" />
        <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={32} animation="wave" />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Skeleton variant="text" width="50%" height={24} animation="wave" />
                <Skeleton variant="text" width="20%" height={24} animation="wave" />
            </Box>
            <Skeleton variant="rounded" width="100%" height={28} animation="wave" />
        </Box>
    </Paper>
);

// Popular Food Card Skeleton
export const PopularFoodCardSkeleton = () => (
    <Paper
        sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: "transform 0.2s",
            "&:hover": {
                transform: "translateY(-5px)",
            }
        }}
    >
        <Skeleton sx={{ borderRadius: 4, width: "100%" }} variant="rectangular" height={180} animation="wave" />
        <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="80%" height={24} animation="wave" />
            <Skeleton variant="text" width="40%" height={20} animation="wave" />
            <Skeleton variant="text" width="30%" height={24} animation="wave" />
            <Skeleton variant="text" width="100%" height={36} animation="wave" />
        </Box>
    </Paper>
);

const CustomerHomePage = () => {
    const { t } = useTranslation();
    // Custom hooks
    const address = useAddress();
    const orders = useOrders();
    const tracking = useTracking();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const selectedAddressObj = useMemo(() => {
        return address.addresses.find(a => a.addressId === address.selectedAddress) || null;
    }, [address.addresses, address.selectedAddress]);
    const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
    const [popularMenuItems, setPopularMenuItems] = useState<Food[]>([]);
    const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
    const [orderData, setOrderData] = useState<{
        orderId: number;
        status: string;
        totalPrice: number;
        estimatedDuration: string;
        paymentType: string;
        note?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState({ restaurants: false, popularItems: false, hero: true });

    const location = useLocation();
    const navigate = useNavigate();
    const selectedAddressName = selectedAddressObj?.name ?? '';
    const selectedAddressFull = selectedAddressObj?.fullAddress ?? '';

    // Load restaurants - using useCallback to prevent recreating this function on every render
    const loadNearbyRestaurants = useCallback(async () => {
        if (!address.selectedAddress) return;

        try {
            const list = await getNearestRestaurants();
            setNearbyRestaurants(
                list.content.map(r => ({
                    id: r.id,
                    restaurantName: r.restaurantName,
                    distanceInKm: r.distanceInKm,
                    profileImg: r.profileImg,
                    rating: r.rating,
                    reviews: r.reviews,
                })) as unknown as Restaurant[]
            );
        } catch (err) {
            console.error('could not load nearby restaurants', err);
        } finally {
            setIsLoading(prev => ({ ...prev, restaurants: false }));
        }
    }, [address.selectedAddress]);

    // Load popular menu items - using useCallback
    const loadPopularMenuItems = useCallback(async () => {
        if (!address.selectedAddress) return;

        try {
            const items = await getPopularMenuItems();
            setPopularMenuItems(
                items.content.filter(mi => mi.isAvailable).map(mi => ({
                    id: mi.id,
                    name: mi.name,
                    image: mi.img,
                    restaurant: mi.restaurant,
                    price: `${mi.price}₺`,
                    description: mi.description
                }))
            );
        } catch (err) {
            console.error('Failed to load popular menu items', err);
        } finally {
            setIsLoading(prev => ({ ...prev, popularItems: false }));
        }
    }, [address.selectedAddress]);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCartCountAsync());
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        setIsLoading(prev => ({ ...prev, hero: true }));

        const heroLoadingTimer = setTimeout(() => {
            setIsLoading(prev => ({ ...prev, hero: false }));
        }, 500);

        return () => {
            clearTimeout(heroLoadingTimer);
        };
    }, []);

    // Fetch data when address is selected
    useEffect(() => {
        if (address.selectedAddress) {
            setIsLoading(prev => ({ ...prev, restaurants: true, popularItems: true }));

            const restaurantTimer = setTimeout(loadNearbyRestaurants, 100);
            const menuItemTimer = setTimeout(loadPopularMenuItems, 200);

            return () => {
                clearTimeout(restaurantTimer);
                clearTimeout(menuItemTimer);
            };
        }
    }, [address.selectedAddress, loadNearbyRestaurants, loadPopularMenuItems]);


    // Check for orderData in navigation state
    useEffect(() => {
        if (location.state?.orderData) {
            setOrderData(location.state.orderData);
            setIsPaymentSuccessOpen(true);
            dispatch(fetchCartCountAsync());
            navigate("/", { replace: true, state: {} });
        }
    }, [location.state, navigate, dispatch]);

    // Memoize the handler to prevent unnecessary re-renders
    const handlePaymentSuccessClose = useCallback(() => {
        dispatch(fetchCartCountAsync());
        setIsPaymentSuccessOpen(false);
        setOrderData(null);
    }, [dispatch]);

    // Memoize the track order handler
    const handleTrackOrderClick = useCallback(async (orderGroup: CustomerCurrentOrderDTO): Promise<void> => {
        return tracking.handleTrackOrder(orderGroup.orderGroupId);
    }, [tracking]);

    // Memoize the noRestaurantsFoundSection to prevent re-renders
    const noRestaurantsFoundSection = useMemo(() => (
        <Box sx={{ py: 6, textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" color="primary" gutterBottom>
                    No Restaurants or Foods Nearby
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    There are currently no restaurants or foods available near your selected address.
                    Please try another address or check back later.
                </Typography>
                <Button
                    variant="contained"
                    onClick={address.handleDialogOpen}
                    size="large"
                >
                    {t('address.change')}
                </Button>
            </Paper>
        </Box>
    ), [address.handleDialogOpen, i18n.language]);

    // Memoize the hero section to prevent re-renders
    const heroSection = useMemo(() => (
        <Grid container spacing={6} sx={{ bgcolor: 'primary.main', mt: { xs: 2, md: 6 }, p: 6, alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, color: 'white' }}><Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                {t('homepage.hero.hello')}, {localStorage.getItem('username')}!
            </Typography>
            <Typography>
                {t('homepage.hero.description1')}<br />
                {t('homepage.hero.description2')}
            </Typography>

            {selectedAddressName && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                    }}
                >
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {selectedAddressName}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {selectedAddressFull}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Button variant="contained" size="large" sx={{ mt: 2, color: 'primary.main', bgcolor: 'white' }} onClick={address.handleDialogOpen}>
                {t('address.select')}
            </Button>
        </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
                {isLoading.hero ? (
                    <Skeleton
                        variant="rounded"
                        height={"320px"}
                        sx={{
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                        animation="wave"
                    />
                ) : (
                    <Box
                        component="img"
                        src="https://i.hizliresim.com/1xcam90.jpeg"
                        alt="Food Delivery"
                        sx={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 4,
                            boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.3)'
                        }}
                    />
                )}
            </Grid>
        </Grid>
    ), [address.handleDialogOpen, i18n.language, isLoading.hero]);

    // Memoize the restaurants section header
    const restaurantsSectionHeader = useMemo(() => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
                {t('homepage.near')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                    variant="body2"
                    component={Link}
                    to="/restaurants"
                    sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {t('util.view')}
                    <ArrowForward sx={{ fontSize: 16, ml: 1 }} />
                </Typography>
            </Box>
        </Box>
    ), [i18n.language]);

    // Combined snackbar state for better performance
    const snackbarState = useMemo(() => {
        const isOpen = orders.snackbarOpen || tracking.snackbarOpen;
        const message = orders.snackbarOpen ? orders.snackbarMessage : tracking.snackbarMessage;
        const severity = orders.snackbarOpen ? orders.snackbarSeverity : tracking.snackbarSeverity;

        return { isOpen, message, severity };
    }, [orders.snackbarOpen, orders.snackbarMessage, orders.snackbarSeverity,
    tracking.snackbarOpen, tracking.snackbarMessage, tracking.snackbarSeverity]);

    // Combined snackbar handler for better performance
    const handleSnackbarClose = useCallback(() => {
        if (orders.snackbarOpen) orders.setSnackbarOpen(false);
        if (tracking.snackbarOpen) tracking.setSnackbarOpen(false);
    }, [orders, tracking, i18n.language]);

    return (
        <Box sx={{ pb: 6 }}>
            {/* Hero Section */}
            {heroSection}

            {/* Current Orders Tracking - Lazy loaded */}
            <Suspense>
                <OrderTracking
                    activeOrderGroups={orders.activeOrderGroups}
                    getOrderSteps={orders.getOrderSteps}
                    formatOrderDate={orders.formatOrderDate}
                    formatEstimatedTime={orders.formatEstimatedTime}
                    calculateRemainingTime={orders.calculateRemainingTime}
                    handleViewOrderDetails={orders.handleViewOrderDetails}
                    handleTrackOrder={handleTrackOrderClick}
                    handleCancelOrderClick={orders.handleCancelOrderClick}
                />
            </Suspense>

            {/* Food Categories */}
            <Box sx={{ py: 6 }}>
                <Suspense fallback={<LoadingFallback />}>
                    <FoodCategories showHeader />
                </Suspense>
            </Box>

            {/* Conditional rendering for restaurant and food sections */}
            {address.selectedAddress ? (
                nearbyRestaurants.length === 0 && popularMenuItems.length === 0 && !isLoading.restaurants && !isLoading.popularItems ? (
                    noRestaurantsFoundSection
                ) : (
                    <>
                        {/* Featured Restaurants */}
                        <Box sx={{ py: 6 }}>
                            {restaurantsSectionHeader}

                            <Grid container spacing={3}>
                                {isLoading.restaurants ? (
                                    // Show restaurant skeletons while loading
                                    Array.from(new Array(4)).map((_, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`restaurant-skeleton-${index}`}>
                                            <RestaurantCardSkeleton />
                                        </Grid>
                                    ))
                                ) : (
                                    // Show actual restaurants when loaded
                                    nearbyRestaurants.map((restaurant) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={restaurant.id}>
                                            <Suspense fallback={<RestaurantCardSkeleton />}>
                                                <RestaurantCard restaurant={restaurant} />
                                            </Suspense>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </Box>

                        {/* Popular Foods */}
                        <Box sx={{ py: 6 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" fontWeight="bold">
                                {t('homepage.popular')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography
                                        variant="body2"
                                        component={Link}
                                        to="/popular-foods"
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {t('util.view')}
                                        <ArrowForward sx={{ fontSize: 16, ml: 1 }} />
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                {isLoading.popularItems ? (
                                    // Show food skeletons while loading
                                    Array.from(new Array(5)).map((_, index) => (
                                        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }} key={`food-skeleton-${index}`}>
                                            <PopularFoodCardSkeleton />
                                        </Grid>
                                    ))
                                ) : popularMenuItems.length > 0 ? (
                                    popularMenuItems.map((food) => (
                                        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }} key={food.id}>
                                            <Suspense fallback={<PopularFoodCardSkeleton />}>
                                                <PopularFoodCard food={food} />
                                            </Suspense>
                                        </Grid>
                                    ))
                                ) : (
                                    <Box sx={{
                                        width: '100%',
                                        textAlign: 'center',
                                        py: 4,
                                    }}>
                                        <Typography variant="h6">
                                            {t('homepage.noPopularItems')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                            {t('homepage.tryAgainLater')}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Box>
                    </>
                )
            ) : (
                <Suspense fallback={<LoadingFallback />}>
                    <AddressSection
                        selectedAddress={address.selectedAddress}
                        handleDialogOpen={address.handleDialogOpen}
                    />
                </Suspense>
            )}

            {/* Dialogs - only render when needed and lazy load them */}
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

            {tracking.isTrackingDialogOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <TrackingDialog
                        open={tracking.isTrackingDialogOpen}
                        onClose={() => tracking.setIsTrackingDialogOpen(false)}
                        trackingInfo={tracking.trackingInfo}
                        orderId={tracking.activeTrackingOrderId}
                    />
                </Suspense>
            )}

            {orders.cancelOrderDialogOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <CancelOrderDialog
                        open={orders.cancelOrderDialogOpen}
                        onClose={() => orders.setCancelOrderDialogOpen(false)}
                        onConfirm={orders.handleCancelOrder}
                    />
                </Suspense>
            )}

            {/* Order Details Modal - only render when needed */}
            {orders.selectedOrderDetails && orders.isOrderDetailsOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <OrderDetailsModal
                        open={orders.isOrderDetailsOpen}
                        onClose={() => orders.setIsOrderDetailsOpen(false)}
                        orderDetails={orders.selectedOrderDetails}
                    />
                </Suspense>
            )}

            {/* Payment Success Popup - only render when needed */}
            {isPaymentSuccessOpen && (
                <Suspense fallback={<LoadingFallback />}>
                    <PaymentSuccessPopup
                        open={isPaymentSuccessOpen}
                        onClose={handlePaymentSuccessClose}
                        orderData={orderData}
                    />
                </Suspense>
            )}

            {/* Global Snackbar for notifications - Optimized */}
            <Snackbar
                open={snackbarState.isOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarState.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CustomerHomePage;