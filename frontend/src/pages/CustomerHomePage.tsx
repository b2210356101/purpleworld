import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Box, Typography, Button, Grid, Paper, Snackbar, Alert, CircularProgress } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAddress } from '../hooks/useAddress';
import { useOrders } from '../hooks/useOrders';
import { useTracking } from '../hooks/useTracking';
import { Restaurant, CustomerCurrentOrderDTO } from '../types';
import { getNearestRestaurants, getPopularMenuItems } from '../utils/api';

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

// Loading fallback component
const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress color="primary" />
    </Box>
);

interface PopularFood {
    id: number;
    name: string;
    image: string;
    restaurant: Restaurant;
    price: string;
    description: string;
}

const CustomerHomePage = () => {
    // Custom hooks
    const address = useAddress();
    const orders = useOrders();
    const tracking = useTracking();

    const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
    const [popularMenuItems, setPopularMenuItems] = useState<PopularFood[]>([]);
    const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
    const [orderData, setOrderData] = useState<{
        orderId: number;
        status: string;
        totalPrice: number;
        estimatedDuration: string;
        paymentType: string;
        note?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState({ restaurants: false, popularItems: false });

    const location = useLocation();
    const navigate = useNavigate();

    // Load restaurants - using useCallback to prevent recreating this function on every render
    const loadNearbyRestaurants = useCallback(async () => {
        if (!address.selectedAddress || isLoading.restaurants) return;

        setIsLoading(prev => ({ ...prev, restaurants: true }));
        try {
            const list = await getNearestRestaurants();
            setNearbyRestaurants(
                list.map(r => ({
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
        if (!address.selectedAddress || isLoading.popularItems) return;

        setIsLoading(prev => ({ ...prev, popularItems: true }));
        try {
            const items = await getPopularMenuItems();
            setPopularMenuItems(
                items.map(mi => ({
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

    // Fetch data when address is selected
    useEffect(() => {
        if (address.selectedAddress) {
            // Use a small timeout to ensure UI is responsive during initial load
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
            window.dispatchEvent(new CustomEvent("cart-updated"));
            // Clear the navigation state to prevent popup on refresh
            navigate("/", { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    // Memoize the handler to prevent unnecessary re-renders
    const handlePaymentSuccessClose = useCallback(() => {
        window.dispatchEvent(new CustomEvent("cart-updated"));
        setIsPaymentSuccessOpen(false);
        setOrderData(null);
    }, []);

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
                    Change Address
                </Button>
            </Paper>
        </Box>
    ), [address.handleDialogOpen]);

    // Memoize the hero section to prevent re-renders
    const heroSection = useMemo(() => (
        <Grid container spacing={6} sx={{ bgcolor: 'primary.main', mt: { xs: 2, md: 6 }, p: 6, alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, color: 'white' }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Hello, {localStorage.getItem('username')}!
                </Typography>
                <Typography>
                    What would you like to eat today?<br />
                    Your favorite flavors are just a click away.
                </Typography>

                <Button variant="contained" size="large" sx={{ mt: 2, color: 'primary.main', bgcolor: 'white' }} onClick={address.handleDialogOpen}>
                    Select Address
                </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
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
            </Grid>
        </Grid>
    ), [address.handleDialogOpen]);

    // Memoize the categories section header
    const categoriesSectionHeader = useMemo(() => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
                Search by Categories
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                    variant="body2"
                    component={Link}
                    to="/categories"
                    sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    View All
                    <ArrowForward sx={{ fontSize: 16, ml: 1 }} />
                </Typography>
            </Box>
        </Box>
    ), []);

    // Memoize the restaurants section header
    const restaurantsSectionHeader = useMemo(() => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
                Nearest Restaurants
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
                    View All
                    <ArrowForward sx={{ fontSize: 16, ml: 1 }} />
                </Typography>
            </Box>
        </Box>
    ), []);

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
    }, [orders, tracking]);

    return (
        <Box sx={{ pb: 6 }}>
            {/* Hero Section */}
            {heroSection}

            {/* Current Orders Tracking - Lazy loaded */}
            <Suspense fallback={<LoadingFallback />}>
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
                {categoriesSectionHeader}
                <Suspense fallback={<LoadingFallback />}>
                    <FoodCategories />
                </Suspense>
            </Box>

            {/* Conditional rendering for restaurant and food sections */}
            {address.selectedAddress ? (
                isLoading.restaurants && isLoading.popularItems ? (
                    <LoadingFallback />
                ) : nearbyRestaurants.length === 0 && popularMenuItems.length === 0 ? (
                    noRestaurantsFoundSection
                ) : (
                    <>
                        {/* Featured Restaurants */}
                        <Box sx={{ py: 6 }}>
                            {restaurantsSectionHeader}

                            <Grid container spacing={3}>
                                {nearbyRestaurants.map((restaurant) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={restaurant.id}>
                                        <Suspense fallback={<LoadingFallback />}>
                                            <RestaurantCard restaurant={restaurant} />
                                        </Suspense>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Popular Foods */}
                        <Box sx={{ py: 6 }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                                Popular Foods
                            </Typography>

                            <Grid container spacing={2}>
                                {popularMenuItems.map((food) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={food.id}>
                                        <Suspense fallback={<LoadingFallback />}>
                                            <PopularFoodCard food={food} />
                                        </Suspense>
                                    </Grid>
                                ))}
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
                        title="Change Address?"
                        message="Changing your address will remove all items in your cart. Are you sure you want to proceed?"
                        confirmText="Yes, Change Address"
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