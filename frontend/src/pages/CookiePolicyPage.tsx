import React from 'react';
import {
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CookieIcon from '@mui/icons-material/Cookie';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Cookie Policy Page Component
 * 
 * This component provides information about how HU-FDS uses cookies and 
 * other tracking technologies, including options for managing cookie preferences.
 */
const CookiePolicyPage: React.FC = () => {
    return (
        <>
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <CookieIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Cookie Policy
                </Typography>
            </Box>

            <Typography variant="body1">
                At Hungry Users Food Delivery System (HU-FDS), we use cookies and similar tracking technologies
                to enhance your browsing experience, analyze site traffic, personalize content, and improve the
                quality of our services. This Cookie Policy explains how we use these technologies, what types
                of cookies we use, and how you can control your cookie preferences.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    What Are Cookies?
                </Typography>
                <Typography variant="body1">
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile phone)
                    when you visit a website. They allow the website to recognize your device and remember some
                    information about your visit, such as your preferences and settings. Cookies are widely used to make
                    websites work more efficiently and provide valuable information to website owners.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon color="primary" />
                            Types of Cookies We Use
                        </Typography>
                        <Typography variant="body1">
                            We use different types of cookies for various purposes:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Essential Cookies"
                                    secondary="These cookies are necessary for the website to function properly and cannot be switched off in our systems"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Performance Cookies"
                                    secondary="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Functional Cookies"
                                    secondary="These cookies enable the website to provide enhanced functionality and personalization"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Targeting Cookies"
                                    secondary="These cookies may be set through our site by our advertising partners to build a profile of your interests"
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon color="primary" />
                            How We Use Cookies
                        </Typography>
                        <Typography variant="body1">
                            We use cookies for the following purposes:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Authentication"
                                    secondary="To recognize you when you log in to use our services"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Preferences"
                                    secondary="To remember information about your preferences and settings"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Analytics"
                                    secondary="To understand how users interact with our website, which pages are visited most often, and identify any issues with our service"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Security"
                                    secondary="To detect and prevent fraudulent activity and ensure the security of your account"
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
            </Grid>

            <Stack gap={2} sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    Managing Your Cookie Preferences
                </Typography>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Cookie Consent Tool</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            When you first visit our website, you will be presented with a cookie banner that allows you to
                            accept or decline non-essential cookies. You can change your preferences at any time by clicking
                            the "Cookie Settings" link in the footer of our website.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Browser Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            Most web browsers allow you to control cookies through their settings preferences. You can typically
                            find these settings in the "Options" or "Preferences" menu of your browser. To understand these
                            settings, the following links may be helpful:
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Disabling Cookies</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            Please note that if you choose to disable cookies, you may not be able to access certain parts of
                            our website or some features may not function properly. In particular, you will not be able to
                            use features that require authentication, such as placing orders or accessing your account information.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Third-Party Cookies</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            Some cookies are placed by third parties on our behalf. These third parties may include analytics
                            providers, advertising networks, and social media platforms. We do not have control over these
                            third-party cookies. You can manage your preferences for third-party cookies through your browser
                            settings or using the opt-out mechanisms provided by these third parties.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BlockIcon color="primary" />
                    Do Not Track Signals
                </Typography>
                <Typography variant="body1">
                    Some browsers have a "Do Not Track" feature that signals to websites you visit that you do not want to
                    have your online activity tracked. Due to the lack of a common industry or legal standard for interpreting
                    these signals, our website does not currently respond to "Do Not Track" signals. However, you can use the
                    cookie management options described above to control how your information is collected through cookies.
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Other Tracking Technologies
                </Typography>
                <Typography variant="body1">
                    In addition to cookies, we may use other similar technologies such as web beacons (pixel tags),
                    device identifiers, and tracking URLs to identify you and track your usage patterns. These
                    technologies work similarly to cookies by storing information locally on your device or by
                    identifying your browser or device.
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Changes to Our Cookie Policy
                </Typography>
                <Typography variant="body1">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for
                    other operational, legal, or regulatory reasons. We will post the updated policy on our website
                    and change the "Last Updated" date. We encourage you to review this policy periodically to stay
                    informed about our use of cookies.
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body1">
                    If you have any questions about our Cookie Policy or how we use cookies, please contact us:
                </Typography>
                <Box sx={{ ml: 2 }}>
                    <Typography variant="body1">
                        <strong>Email:</strong> info@purpleworld.tr
                    </Typography>
                    <Typography variant="body1">
                        <strong>Address:</strong> Hacettepe Atatepe Otoparkı, Purple World, Ankara / Türkiye
                    </Typography>
                    <Typography variant="body1">
                        <strong>Phone:</strong> +90 123 456 7890
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 4, bgcolor: 'primary.light', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Last Updated: April 29, 2025
                </Typography>
            </Box>
        </>
    );
};

export default CookiePolicyPage;