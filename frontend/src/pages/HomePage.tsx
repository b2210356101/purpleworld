import { Box, Button, Grid, Typography } from '@mui/material';
import {
    LocalShipping,
    VerifiedUser,
    TouchApp,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import FoodCategories from '../components/menu/FoodCategories';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation();

    return (
        <Box>
            {/* Hero Section */}
            <Grid container spacing={6} sx={{ mt: { xs: 2, md: 6 }, py: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography component="h1" sx={{ color: 'text.primary', fontWeight: 800, fontSize: 42 }} gutterBottom>
                        Purple World {<br />} {t('homepage.hero.title')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        {t('homepage.hero.text')}
                    </Typography>
                    <Button component={Link} to="/login" variant="contained" color="secondary" size="large" sx={{ mt: 2 }}>
                        {t('homepage.hero.login')}
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
                    <Box
                        component="img"
                        src="https://i.hizliresim.com/lw29wkx.jpeg"
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
                    {t('homepage.whyChooseUs')}
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
                                {t('homepage.features.fastDelivery.title')}
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                {t('homepage.features.fastDelivery.description')}
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
                                {t('homepage.features.reliableService.title')}
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                {t('homepage.features.reliableService.description')}
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
                                {t('homepage.features.easyToUse.title')}
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                {t('homepage.features.easyToUse.description')}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Restaurant Section */}
            <Box sx={{ bgcolor: 'primary.light', p: { xs: 4, md: 6 }, pb: { xs: 14, md: 6 }, my: 6, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>

                <Typography variant="h4" component="h2" gutterBottom>
                    {t('homepage.restaurantSection.title')}
                </Typography>
                <Typography>
                    {t('homepage.restaurantSection.description1')}
                </Typography>
                <Typography>
                    {t('homepage.restaurantSection.description2')}
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Button
                        component={Link}
                        to="/register?tab=1"
                        variant="contained"
                        color="primary"
                        sx={{ mr: 2 }}
                    >
                        {t('homepage.restaurantSection.addButton')}
                    </Button>
                    <Button
                        component={Link}
                        to="/contact"
                        variant="outlined"
                        color="primary"
                    >
                        {t('homepage.restaurantSection.contactButton')}
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

export default HomePage;