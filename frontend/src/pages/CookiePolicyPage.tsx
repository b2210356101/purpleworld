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
import { useTranslation } from 'react-i18next';

// ai-gen start (claude)
const CookiePolicyPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <CookieIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('cookiePolicy.title')}
                </Typography>
            </Box>

            <Typography variant="body1">
                {t('cookiePolicy.introduction')}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    {t('cookiePolicy.whatAreCookies.title')}
                </Typography>
                <Typography variant="body1">
                    {t('cookiePolicy.whatAreCookies.description')}
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon color="primary" />
                            {t('cookiePolicy.typesOfCookies.title')}
                        </Typography>
                        <Typography variant="body1">
                            {t('cookiePolicy.typesOfCookies.description')}
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('cookiePolicy.typesOfCookies.essential')}
                                    secondary={t('cookiePolicy.typesOfCookies.essentialDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('cookiePolicy.typesOfCookies.performance')}
                                    secondary={t('cookiePolicy.typesOfCookies.performanceDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('cookiePolicy.typesOfCookies.functional')}
                                    secondary={t('cookiePolicy.typesOfCookies.functionalDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleOutlineIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('cookiePolicy.typesOfCookies.targeting')}
                                    secondary={t('cookiePolicy.typesOfCookies.targetingDesc')}
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon color="primary" />
                            {t('cookiePolicy.howWeUse.title')}
                        </Typography>
                        <Typography variant="body1">
                            {t('cookiePolicy.howWeUse.description')}
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary={t('cookiePolicy.howWeUse.authentication')}
                                    secondary={t('cookiePolicy.howWeUse.authenticationDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('cookiePolicy.howWeUse.preferences')}
                                    secondary={t('cookiePolicy.howWeUse.preferencesDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('cookiePolicy.howWeUse.analytics')}
                                    secondary={t('cookiePolicy.howWeUse.analyticsDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('cookiePolicy.howWeUse.security')}
                                    secondary={t('cookiePolicy.howWeUse.securityDesc')}
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
            </Grid>

            <Stack gap={2} sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    {t('cookiePolicy.managingPreferences.title')}
                </Typography>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('cookiePolicy.managingPreferences.consentTool')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('cookiePolicy.managingPreferences.consentToolDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('cookiePolicy.managingPreferences.browserSettings')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('cookiePolicy.managingPreferences.browserSettingsDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('cookiePolicy.managingPreferences.disablingCookies')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('cookiePolicy.managingPreferences.disablingCookiesDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('cookiePolicy.managingPreferences.thirdPartyCookies')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('cookiePolicy.managingPreferences.thirdPartyCookiesDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BlockIcon color="primary" />
                    {t('cookiePolicy.doNotTrack.title')}
                </Typography>
                <Typography variant="body1">
                    {t('cookiePolicy.doNotTrack.description')}
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('cookiePolicy.otherTechnologies.title')}
                </Typography>
                <Typography variant="body1">
                    {t('cookiePolicy.otherTechnologies.description')}
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('cookiePolicy.changes.title')}
                </Typography>
                <Typography variant="body1">
                    {t('cookiePolicy.changes.description')}
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('cookiePolicy.contactUs.title')}
                </Typography>
                <Typography variant="body1">
                    {t('cookiePolicy.contactUs.description')}
                </Typography>
                <Box sx={{ ml: 2 }}>
                    <Typography variant="body1">
                        <strong>{t('cookiePolicy.contactUs.email')}:</strong> info@purpleworld.tr
                    </Typography>
                    <Typography variant="body1">
                        <strong>{t('cookiePolicy.contactUs.address')}:</strong> Hacettepe Atatepe Otoparkı, Purple World, Ankara / Türkiye
                    </Typography>
                    <Typography variant="body1">
                        <strong>{t('cookiePolicy.contactUs.phone')}:</strong> +90 123 456 7890
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 4, bgcolor: 'primary.light', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {t('cookiePolicy.lastUpdated')}
                </Typography>
            </Box>
        </>
    );
    // ai-gen end
};

export default CookiePolicyPage;