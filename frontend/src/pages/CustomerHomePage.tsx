import { Box, Typography, Button, Avatar, Paper, Grid, Stack, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Alert, MenuItem, IconButton } from '@mui/material';
import { ArrowForward, CircleRounded, Add, LocationOn, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/restaurant/RestaurantCart';
import PopularFoodCard from '../components/menu/PopularFoodCard';
import FoodCategories from '../components/menu/FoodCategories';
import React, { useState, useEffect } from 'react';
import AddAddressModal from '../components/address/AddAddressModal';
import { Address, Restaurant } from '../types';
import api, {
    getCurrentAddress,
    getCustomerAddresses,
    saveAddress,
    updateAddress,
    setCurrentAddress,
    getNearestRestaurants,
    getPopularMenuItems
} from '../utils/api';
import DeleteIcon from "@mui/icons-material/Delete";

interface PopularFood {
    id: number;
    name: string;
    image: string;
    restaurant: Restaurant;
    price: string;
    description: string;
}

interface ApiAddress {
    addressId: number;
    name: string;
    city: string;
    district: string;
    neighborhood: string;
    street: string | null;
    buildingNumber: string;
    floor: string;
    apartmentNumber: string;
    fullAddress: string;
    phoneNumber: string;
}

const CustomerHomePage = () => {
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [isNewAddressDialogOpen, setIsNewAddressDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = async () => {
        try {
            const data = await getCustomerAddresses();

            // Initialize addresses as empty array by default
            let formattedAddresses: Address[] = [];

            if (data && data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
                // Transform API addresses to match our Address type
                formattedAddresses = data.addresses.map((addr: ApiAddress) => ({
                    addressId: addr.addressId,
                    name: addr.name,
                    fullAddress: addr.fullAddress,
                    phoneNumber: addr.phoneNumber,
                    neighborhood: addr.neighborhood,
                    buildingNumber: addr.buildingNumber,
                    floor: addr.floor,
                    apartmentNumber: addr.apartmentNumber,
                    city: addr.city,
                    district: addr.district,
                    street: addr.street || '',
                }));
            }

            const currentAddress = await getCurrentAddress();

            // Set addresses (either with parsed data or empty array)
            setAddresses(formattedAddresses);

            if (currentAddress) {
                setSelectedAddress(currentAddress.addressId);
            } else {
                setSelectedAddress(null);
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError('Failed to load addresses. Please try again later.');
        }
    };

    // fetchAddresses in useEffect
    useEffect(() => {
        fetchAddresses();
    }, []);

    const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);

    // Only fetch restaurants when an address is selected
    useEffect(() => {
        if (selectedAddress) {
            (async () => {
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
                }
            })();
        }
    }, [selectedAddress]);

    const [popularMenuItems, setPopularMenuItems] = useState<PopularFood[]>([]);

    // Only fetch popular menu items when an address is selected
    useEffect(() => {
        if (selectedAddress) {
            (async () => {
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
                }
            })();
        }
    }, [selectedAddress]);

    const handleDialogOpen = () => {
        setIsAddressDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsAddressDialogOpen(false);
    };

    const handleAddNewAddress = () => {
        setIsEditMode(false);
        setAddressToEdit(null);
        setIsNewAddressDialogOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setIsEditMode(true);
        setAddressToEdit(address);
        setIsNewAddressDialogOpen(true);
    };

    const handleSaveNewAddress = async (address: Omit<Address, 'id'>, location: { lat: number, lng: number } | null) => {
        try {
            await saveAddress(address, location);

            // Reload all addresses
            await fetchAddresses();

            setIsNewAddressDialogOpen(false);
        } catch (error) {
            // Handle errors
            console.error('Error saving address:', error);
        }
    };

    const handleUpdateAddress = async (address: Address, location: { lat: number, lng: number } | null) => {
        try {
            // Call the API to update the address
            await updateAddress(address, location);

            // Reload all addresses
            await fetchAddresses();

            // Close the modal
            setIsNewAddressDialogOpen(false);

            // Reset edit state
            setIsEditMode(false);
            setAddressToEdit(null);
        } catch (error) {
            console.error('Error updating address:', error);
            // Handle error - you might want to show an error message to the user
        }
    };

    const handleSaveAddresses = async () => {
        if (!selectedAddress) {
            setError('Please select an address first');
            return;
        }

        try {
            await setCurrentAddress(selectedAddress);

            // Refetch nearby restaurants and popular menu items
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
                console.error('Failed to refresh data after address change:', err);
            }

            handleDialogClose();
        } catch (error) {
            setError('Failed to set current address. Please try again.');
        }
    };

    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAddress(Number(event.target.value));
    };

    const handleDeleteAddress = async (addressId: number) => {
        try {
            await api.delete(`/customer/address?addressId=${addressId}`);
            await fetchAddresses();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category. Please try again.');
        }
    };

    // Current order information
    const currentOrder = {
        id: "27349",
        timeRemaining: "25 mins",
        placedAt: "14:45",
        estimatedDelivery: "15:10",
        status: "preparing", // confirmed, preparing, on-the-way, delivered
        restaurant: "McBurgers",
        items: 2,
        distance: "1.2 km"
    };

    // Order status steps
    const orderSteps = [
        { label: 'Confirmed', status: 'completed' },
        { label: 'Preparing', status: 'active' },
        { label: 'On the way', status: 'pending' },
        { label: 'Delivered', status: 'pending' }
    ];

    return (
        <Box sx={{ pb: 6 }}>

            {/* Hero Section */}
            <Grid container spacing={6} sx={{ bgcolor: 'primary.main', mt: { xs: 2, md: 6 }, p: 6, alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, color: 'white' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Hello, {localStorage.getItem('username')}!
                    </Typography>
                    <Typography>
                        What would you like to eat today?<br />
                        Your favorite flavors are just a click away.
                    </Typography>

                    <Button variant="contained" size="large" sx={{ mt: 2, color: 'primary.main', bgcolor: 'white' }} onClick={handleDialogOpen}>
                        Select Address
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
                    <Box
                        component="img"
                        src="src/assets/hero-customer.jpeg"
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

            {/* Current Order Tracking */}
            {currentOrder && (
                <Paper sx={{ borderRadius: 4, my: 6 }}>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">
                                    Current Order
                                </Typography>
                                <Typography color="text.secondary">
                                    Order #{currentOrder.id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Placed at {currentOrder.placedAt}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="bold" color="secondary">
                                    {currentOrder.timeRemaining}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Estimated delivery at {currentOrder.estimatedDelivery}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Order Status Progress */}
                        <Box sx={{ my: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', mb: 1 }}>
                                {orderSteps.map((step, index) => (
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                                        {step.status === 'completed' ? (
                                            <Box sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>
                                                ✓
                                            </Box>
                                        ) : step.status === 'active' ? (
                                            <Box sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>
                                                ✓
                                            </Box>
                                        ) : (
                                            <CircleRounded sx={{ color: '#d1d1d1', fontSize: 28 }} />
                                        )}
                                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                            {step.label}
                                        </Typography>
                                    </Box>
                                ))}

                                {/* Progress Bar */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 14,
                                    left: 20,
                                    right: 20,
                                    height: 2,
                                    bgcolor: '#d1d1d1',
                                    zIndex: 1
                                }} />
                                <Box sx={{
                                    position: 'absolute',
                                    top: 14,
                                    left: 20,
                                    width: '35%',
                                    height: 2,
                                    bgcolor: 'primary.main',
                                    zIndex: 1
                                }} />
                            </Box>
                        </Box>

                        <Stack direction={{ xs: "column", md: "row" }} gap={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2 }} src="https://picsum.photos/40/40" />
                                <Box>
                                    <Typography sx={{ fontWeight: 500 }}>
                                        {currentOrder.restaurant}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {currentOrder.items} items • {currentOrder.distance} away
                                    </Typography>
                                </Box>
                            </Box>

                            <Stack direction="row" gap={2}>
                                <Button variant="outlined" color="secondary">
                                    Cancel Order
                                </Button>
                                <Button variant="contained">
                                    View Details
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            )}

            {/* Food Categories */}
            <Box sx={{ py: 6 }}>
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

                <FoodCategories />
            </Box>

            {/* Conditional rendering for restaurant and food sections */}
            {selectedAddress ? (
                <>
                    {/* Featured Restaurants */}
                    <Box sx={{ py: 6 }}>
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

                        <Grid container spacing={3}>
                            {nearbyRestaurants.map((restaurant) => (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={restaurant.id}>
                                    <RestaurantCard restaurant={restaurant} />
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
                                    <PopularFoodCard food={food} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </>
            ) : (
                // Message prompting user to select an address when none is selected
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Paper elevation={3} sx={{ p: 5, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                            Please Select an Address
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            To view restaurants and foods near you, please select a delivery address.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleDialogOpen}
                            startIcon={<LocationOn />}
                            size="large"
                        >
                            Select Address
                        </Button>
                    </Paper>
                </Box>
            )}

            {/* Address Selection Dialog */}
            <Dialog open={isAddressDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="md">
                <DialogTitle>Select Your Addresses</DialogTitle>
                <DialogContent>
                    {error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    ) : addresses.length === 0 ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            You don't have any saved addresses yet. Please add a new address.
                        </Alert>
                    ) : (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Your saved addresses
                            </Typography>
                            <RadioGroup
                                value={selectedAddress}
                                onChange={handleAddressChange}
                            >
                                {addresses.map((address, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <FormControlLabel
                                            value={address.addressId}
                                            control={<Radio />}
                                            label={
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography variant="body1">{address.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{address.fullAddress}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{address.phoneNumber}</Typography>
                                                </Box>
                                            }
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEditAddress(address)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteAddress(address.addressId)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </RadioGroup>
                        </Box>
                    )}

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                fullWidth
                                onClick={handleAddNewAddress}
                            >
                                Add New Address
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Button
                                component={Link}
                                to="/profile"
                                variant="outlined"
                                fullWidth
                                sx={{ color: 'secondary.main', borderColor: 'secondary.main' }}
                            >
                                Manage Addresses
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveAddresses}
                        disabled={!selectedAddress && addresses.length > 0}
                        variant="contained"
                        color="primary"
                    >
                        Select Address
                    </Button>
                </DialogActions>
            </Dialog>

            <AddAddressModal
                open={isNewAddressDialogOpen}
                onClose={() => {
                    setIsNewAddressDialogOpen(false);
                    setIsEditMode(false);
                    setAddressToEdit(null);
                }}
                onSave={isEditMode ? handleUpdateAddress : handleSaveNewAddress}
                isEditMode={isEditMode}
                addressData={addressToEdit}
            />
        </Box>
    );
};

export default CustomerHomePage;