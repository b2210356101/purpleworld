import { Box, Typography, Button, Avatar, Paper, Grid, Stack } from '@mui/material';
import { ArrowForward, CircleRounded, Restaurant, } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/restaurant/RestaurantCart';
import PopularFoodCard from '../components/menu/PopularFoodCard';
import FoodCategories from '../components/menu/FoodCategories';


interface PopularFood {
    id: number;
    name: string;
    image: string;
    restaurant: string;
    price: string;
}

interface Restaurant {
    id: number;
    name: string;
    image: string;
    logo?: string;
    rating: number;
    reviews: number;
}

const CustomerHomePage = () => {
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


    // Popular foods
    const popularFoods: PopularFood[] = [
        {
            id: 1,
            name: 'Cheese Burger',
            image: 'https://picsum.photos/300/230',
            restaurant: 'Burger Arena',
            price: '320₺'
        },
        {
            id: 2,
            name: 'Toffe\'s Cake',
            image: 'https://picsum.photos/300/220',
            restaurant: 'Top Sticks',
            price: '280₺'
        },
        {
            id: 3,
            name: 'Dancake',
            image: 'https://picsum.photos/320/200',
            restaurant: 'Donuts hut',
            price: '235₺'
        },
        {
            id: 4,
            name: 'Crispy Sandwich',
            image: 'https://picsum.photos/310/200',
            restaurant: 'Fastfood Dine',
            price: '320₺'
        },
        {
            id: 5,
            name: 'Thai Soup',
            image: 'https://picsum.photos/300/210',
            restaurant: 'Foody man',
            price: '620₺'
        }
    ];

    // Featured restaurants
    const featuredRestaurants: Restaurant[] = [
        {
            id: 1,
            name: "Foodworld",
            image: "https://picsum.photos/400/250",
            logo: "https://picsum.photos/61/60",
            rating: 4.8,
            reviews: 325,
        },
        {
            id: 2,
            name: "McBurgers",
            image: "https://picsum.photos/400/250",
            logo: "https://picsum.photos/60/50",
            rating: 4.9,
            reviews: 1360,
        },
        {
            id: 3,
            name: "Donuts hut",
            image: "https://picsum.photos/400/250",
            logo: "https://picsum.photos/50/60",
            rating: 4.7,
            reviews: 534,
        },
        {
            id: 4,
            name: "Domitoz Pizza",
            image: "https://picsum.photos/400/250",
            logo: "https://picsum.photos/40/60",
            rating: 4.6,
            reviews: 635,
        }
    ];

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
                        Hello, Beste!
                    </Typography>
                    <Typography>
                        What would you like to eat today?<br />
                        Your favorite flavors are just a click away.
                    </Typography>

                    <Button variant="contained" size="large" sx={{ mt: 2, color: 'primary.main', bgcolor: 'white' }}>
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

            {/* Featured Restaurants */}
            <Box sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Featured Restaurants
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

                <Grid container spacing={3}>
                    {featuredRestaurants.map((restaurant) => (
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
                    {popularFoods.map((food) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={food.id}>
                            <PopularFoodCard food={food} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default CustomerHomePage;
