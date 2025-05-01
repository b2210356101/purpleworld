import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.light',
                py: 3,
                borderTop: '1px solid #eaeaea'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Logo & Description */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            component={Link}
                            to="/"
                            sx={{ display: 'flex', mb: 2 }}
                        >
                            <img
                                src="/src/assets/logo.svg"
                                alt="Logo"
                                height="42"
                                style={{
                                    marginRight: '10px',
                                }}
                            />
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ maxWidth: '80%' }}
                        >
                            Discover local and global cuisines near you. Fast delivery, just a few clicks with Purple World.
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                                <InstagramIcon />
                            </IconButton>
                            <IconButton size="small">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton size="small">
                                <LinkedInIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 6, md: 2 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                            }}
                        >
                            Quick links
                        </Typography>
                        <List>
                            <ListItem key={'restaurants'} disablePadding component={Link} to={'/restaurants'} sx={{ color: 'inherit' }}>
                                <ListItemButton disableGutters sx={{ py: 0 }}>
                                    <ListItemText secondary={'Restaurants'} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem key={'cookie'} disablePadding component={Link} to={'/cookie'} sx={{ color: 'inherit' }}>
                                <ListItemButton disableGutters sx={{ py: 0 }}>
                                    <ListItemText secondary={'Cookie Policy'} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem key={'gdpr'} disablePadding component={Link} to={'/gdpr'} sx={{ color: 'inherit' }}>
                                <ListItemButton disableGutters sx={{ py: 0 }}>
                                    <ListItemText secondary={'GDPR'} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Grid>

                    {/* Get to Know Us */}
                    <Grid size={{ xs: 6, md: 2 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                            }}
                        >
                            Get to Know Us
                        </Typography>
                        <List>
                            <ListItem key={'about'} disablePadding component={Link} to={'/about'} sx={{ color: 'inherit' }}>
                                <ListItemButton disableGutters sx={{ py: 0 }}>
                                    <ListItemText secondary={'About Us'} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Grid>

                    {/* Contact */}
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                            }}
                        >
                            Contact
                        </Typography>
                        <List>
                            <ListItem key={'contact'} disablePadding component={Link} to={'/contact'} sx={{ color: 'inherit' }}>
                                <ListItemButton disableGutters sx={{ py: 0 }}>
                                    <ListItemText secondary={'24/7 Support'} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>

                {/* Copyright */}
                <Box
                    sx={{
                        mt: 2,
                        pt: 3,
                        borderTop: '1px solid #eaeaea',
                        textAlign: 'center'
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: '12px' }}
                    >
                        © 2025 <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>Purple World</Box>. All right reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;