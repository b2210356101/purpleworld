import { Box, Button, Grid, Typography } from '@mui/material';
import {
    LocalShipping,
    VerifiedUser,
    TouchApp,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import FoodCategories from '../components/menu/FoodCategories';

const HomePage = () => {
    return (
        <Box>
            {/* Hero Section */}
            <Grid container spacing={6} sx={{ mt: { xs: 2, md: 6 }, py: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography component="h1" sx={{ color: 'text.primary', fontWeight: 800, fontSize: 42 }} gutterBottom>
                        Purple World {<br></br>} Food Delivery
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        Discover hundreds of restaurants and cuisines in your area. From local favorites to international delights, HU-FDS brings the best food options directly to you with just a few clicks. Fast delivery, reliable service, and a seamless ordering experience await.
                    </Typography>
                    <Button component={Link} to="/login" variant="contained" color="secondary" size="large" sx={{ mt: 2 }}>
                        Login Now
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
                    <Box
                        component="img"
                        src="https://picsum.photos/500/350"
                        alt="Food Delivery"
                        sx={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 2,
                            boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.3)'
                        }}
                    />
                </Grid>
            </Grid>

            {/* Food Categories Section */}
            <Box sx={{ py: 6 }}>
                <FoodCategories />
            </Box>

            {/* Why Choose Us Section */}
            <Box sx={{ py: 6 }}>
                <Typography component="h2" variant="h4" sx={{ textAlign: 'center', mb: 4 }}>
                    Why Choose Us?
                </Typography>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{
                            bgcolor: 'primary.light',
                            borderRadius: 4,
                            p: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Box
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '50%',
                                    width: 80,
                                    height: 80,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 3,
                                    color: 'primary.dark',
                                    border: '1px solid #e0d8e9'
                                }}
                            >
                                <LocalShipping sx={{ fontSize: 40 }} />
                            </Box>

                            <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }} gutterBottom>
                                Fast Delivery
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                Get your food delivered to your doorstep in minutes. Enjoy hot and fresh meals thanks to our dedicated courier network.
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{
                            bgcolor: 'primary.light',
                            borderRadius: 4,
                            p: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Box
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '50%',
                                    width: 80,
                                    height: 80,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 3,
                                    color: 'primary.dark',
                                    border: '1px solid #e0d8e9'
                                }}
                            >
                                <VerifiedUser sx={{ fontSize: 40 }} />
                            </Box>

                            <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }} gutterBottom>
                                Reliable Service
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                Track every order and see real-time updates on your delivery status. We always keep our delivery promise.
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{
                            bgcolor: 'primary.light',
                            borderRadius: 4,
                            p: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Box
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '50%',
                                    width: 80,
                                    height: 80,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 3,
                                    color: 'primary.dark',
                                    border: '1px solid #e0d8e9',
                                }}
                            >
                                <TouchApp sx={{ fontSize: 40 }} />
                            </Box>

                            <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }} gutterBottom>
                                Easy to Use
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                Order from your favorite restaurants with just a few clicks using our simple and user-friendly interface. No complicated processes, just delicious food.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Restaurant Section */}
            <Box sx={{ bgcolor: 'primary.light', p: { xs: 4, md: 6 }, pb: { xs: 14, md: 6 }, my: 6, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>

                <Typography variant="h4" component="h2" gutterBottom>
                    Add Your Restaurant to Purple World Food Delivery
                </Typography>
                <Typography>
                    Expand your restaurant's reach and boost your revenue by joining our growing network of food partners. With Purple World, you'll gain access to thousands of hungry customers looking for quality food delivered right to their doorstep.
                </Typography>
                <Typography>
                    Our platform makes it easy to manage orders, customize your menu, and track your performance in real-time. We handle the delivery logistics so you can focus on what you do best - creating delicious food that keeps customers coming back for more.
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        color="primary"
                        sx={{ mr: 2 }}
                    >
                        Add Now
                    </Button>
                    <Button
                        component={Link}
                        to="/contact"
                        variant="outlined"
                        color="primary"
                    >
                        Contact Us
                    </Button>
                </Box>

                {/* Motorcycle image in bottom right */}
                <Box
                    component="img"
                    src="https://i.hizliresim.com/5515wz8.png"
                    alt="Delivery Motorcycle"
                    sx={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '30px',
                        width: '140px',
                        height: 'auto',
                        opacity: 0.9,
                    }}
                />
            </Box>
        </Box>
    );
};

export default HomePage
