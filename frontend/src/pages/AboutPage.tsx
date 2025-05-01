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

const teamMembers = [
    {
        name: "Beste Özdemir",
        position: "Developer, Architect",
        bio: "Beste designs the system architecture and develops core functionalities, ensuring our platform is optimized for performance, scalability and security.",
        avatar: "/src/assets/beste.jpeg"
    },
    {
        name: "Azra Sena Kansu",
        position: "Developer, Manager",
        bio: "Azra leads development initiatives and manages team workflows, ensuring efficient collaboration while contributing to critical user-facing features.",
        avatar: "/src/assets/azra.jpeg"
    },
    {
        name: "Sinan Doğan",
        position: "Developer, Tester",
        bio: "Sinan develops key frontend components and implements comprehensive testing strategies to ensure our platform meets the highest quality standards.",
        avatar: "/src/assets/sinan.jpeg"
    },
    {
        name: "Ezgi Ekin",
        position: "Developer, Analyst",
        bio: "Ezgi analyzes user requirements and develops corresponding features, translating business needs into technical solutions for our delivery platform.",
        avatar: "/src/assets/ezgi.jpeg"
    },
    {
        name: "M. Kaan Çevik",
        position: "Developer, Config. Manager",
        bio: "Kaan handles configuration management and develops backend services, maintaining system integrity across development and production environments.",
        avatar: "/src/assets/kaan.jpeg"
    }
];

const AboutPage: React.FC = () => {
    return (
        <Box>
            {/* Our Story */}
            <Box sx={{ my: 6 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    Our Story
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                    Purple World Food Delivery began with a simple idea: to create a better food delivery experience for everyone involved - customers, restaurants, and couriers.
                </Typography>

                <Grid container spacing={4} sx={{ mt: 4, alignItems: 'center', }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box component="img"
                            src="src/assets/about.jpg"
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
                            From Local to National
                        </Typography>
                        <Typography variant="body1">
                            What started as a small operation in Ankara has now grown into a nationwide service connecting thousands of restaurants with hungry customers across Turkey.
                        </Typography>
                        <Typography variant="body1">
                            We've built our platform with a focus on technology that makes ordering food as simple and enjoyable as possible, while also ensuring restaurants can efficiently manage their deliveries and our couriers can maximize their earnings.
                        </Typography>
                        <Typography variant="body1">
                            Today, we're proud to be Turkey's fastest-growing food delivery platform, with plans to expand our services even further in the coming years.
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Stats Section */}
            <Box sx={{ my: 8, bgcolor: 'primary.main', py: 6, px: 4, borderRadius: 6, color: 'white' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    Purple World by the Numbers
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
                    Our impact on the food delivery ecosystem in Turkey
                </Typography>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                1M+
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                Orders Delivered
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                2,500+
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                Restaurant Partners
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                25
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                Cities Served
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                4.8/5
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                                Customer Rating
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Team Section */}
            <Box sx={{ my: 8 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
                    Meet Our Team
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
                    The passionate individuals behind Purple World Food Delivery
                </Typography>

                <Grid container spacing={4}>
                    {teamMembers.map((member, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
                            <Paper sx={{ p: 1.4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRadius: 4 }}>
                                <Avatar
                                    src={member.avatar}
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
                    Join the Purple World Family
                </Typography>
                <Typography sx={{ maxWidth: '80%' }}>
                    Whether you're a restaurant looking to expand your customer base, a driver seeking flexible work, or a food enthusiast who wants to join our team, we'd love to hear from you.
                </Typography>
                <Typography sx={{ maxWidth: '80%' }}>
                    At Purple World, we're always looking for passionate individuals and businesses that share our vision for transforming the food delivery experience in Turkey.
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        color="primary"
                        sx={{ mr: 2 }}
                    >
                        Add Your Restaurant
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

export default AboutPage;