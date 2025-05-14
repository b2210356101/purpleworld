import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Avatar,
    Button,
    Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Takım üyeleri için tip tanımı
interface TeamMember {
    name: string;
    position: string;
    bio: string;
}

const AboutPage: React.FC = () => {
    const { t } = useTranslation();

    const teamMembers = t('about.team.members', { returnObjects: true }) as TeamMember[];

    return (
        <Box>
            {/* Our Story */}
            <Box sx={{ my: 6 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    {t('about.ourStory.title')}
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                    {t('about.ourStory.intro')}
                </Typography>

                <Grid container spacing={4} sx={{ mt: 4, alignItems: 'center', }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box component="img"
                            src="https://i.hizliresim.com/19zypoe.png"
                            alt="Restaurant Partner"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 4,
                                boxShadow: 2
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {t('about.ourStory.sectionTitle')}
                        </Typography>
                        <Typography variant="body1">
                            {t('about.ourStory.paragraph1')}
                        </Typography>
                        <Typography variant="body1">
                            {t('about.ourStory.paragraph2')}
                        </Typography>
                        <Typography variant="body1">
                            {t('about.ourStory.paragraph3')}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Stats Section */}
            <Box sx={{ my: 8, bgcolor: 'primary.main', py: 6, px: 4, borderRadius: 6, color: 'white' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    {t('about.stats.title')}
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
                    {t('about.stats.subtitle')}
                </Typography>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                1M+
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                {t('about.stats.orders')}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                2,500+
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                {t('about.stats.restaurants')}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                25
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                {t('about.stats.cities')}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                4.8/5
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                {t('about.stats.rating')}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Team Section */}
            <Box sx={{ my: 8 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    {t('about.team.title')}
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
                    {t('about.team.subtitle')}
                </Typography>

                <Grid container spacing={4}>
                    {Array.isArray(teamMembers) && teamMembers.map((member: TeamMember, index: number) => (
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
                            <Paper sx={{ p: 1.4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRadius: 4 }}>
                                <Avatar
                                    src={
                                        member.name.split(' ')[0].length <= 2
                                            ? `/src/assets/${member.name.split(' ')[1].toLowerCase()}.jpeg`
                                            : `/src/assets/${member.name.split(' ')[0].toLowerCase()}.jpeg`
                                    }
                                    alt={member.name}
                                    sx={{ width: 100, height: 100, mb: 2, border: '4px solid', borderColor: 'primary.light' }}
                                />
                                <Typography variant="h6" fontWeight="bold">
                                    {member.name}
                                </Typography>
                                <Typography variant="subtitle1" color="primary.main" >
                                    {member.position}
                                </Typography>
                                <Divider sx={{ width: '50%', my: 2 }} />
                                <Typography variant="body2">
                                    {member.bio}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Join Us CTA */}
            <Box sx={{ bgcolor: 'primary.light', p: { xs: 4, md: 6 }, pb: { xs: 14, md: 6 }, my: 6, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                    {t('about.joinUs.title')}
                </Typography>
                <Typography sx={{ maxWidth: '80%' }}>
                    {t('about.joinUs.paragraph1')}
                </Typography>
                <Typography sx={{ maxWidth: '80%' }}>
                    {t('about.joinUs.paragraph2')}
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        color="primary"
                        sx={{ mr: 2 }}
                    >
                        {t('about.joinUs.addRestaurant')}
                    </Button>
                    <Button
                        component={Link}
                        to="/contact"
                        variant="outlined"
                        color="primary"
                    >
                        {t('about.joinUs.contactUs')}
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

export default AboutPage;