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
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import GavelIcon from '@mui/icons-material/Gavel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

const GDPRPage: React.FC = () => {
    const { t } = useTranslation();
    // ai-gen start (claude)
    return (
        <>
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('gdpr.title')}
                </Typography>
            </Box>

            <Typography variant="body1">
                {t('gdpr.introduction')}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DataUsageIcon color="primary" />
                            {t('gdpr.dataWeCollect.title')}
                        </Typography>
                        <Typography variant="body1">
                            {t('gdpr.dataWeCollect.description')}
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('gdpr.dataWeCollect.accountInfo')}
                                    secondary={t('gdpr.dataWeCollect.accountInfoDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('gdpr.dataWeCollect.deliveryInfo')}
                                    secondary={t('gdpr.dataWeCollect.deliveryInfoDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('gdpr.dataWeCollect.paymentInfo')}
                                    secondary={t('gdpr.dataWeCollect.paymentInfoDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('gdpr.dataWeCollect.usageData')}
                                    secondary={t('gdpr.dataWeCollect.usageDataDesc')}
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GavelIcon color="primary" />
                            {t('gdpr.legalBasis.title')}
                        </Typography>
                        <Typography variant="body1">
                            {t('gdpr.legalBasis.description')}
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary={t('gdpr.legalBasis.contractPerformance')}
                                    secondary={t('gdpr.legalBasis.contractPerformanceDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('gdpr.legalBasis.legitimateInterests')}
                                    secondary={t('gdpr.legalBasis.legitimateInterestsDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('gdpr.legalBasis.consent')}
                                    secondary={t('gdpr.legalBasis.consentDesc')}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t('gdpr.legalBasis.legalObligations')}
                                    secondary={t('gdpr.legalBasis.legalObligationsDesc')}
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
            </Grid>

            <Stack gap={2} sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrivacyTipIcon color="primary" />
                    {t('gdpr.yourRights.title')}
                </Typography>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('gdpr.yourRights.rightToAccess')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('gdpr.yourRights.rightToAccessDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('gdpr.yourRights.rightToRectification')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('gdpr.yourRights.rightToRectificationDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('gdpr.yourRights.rightToErasure')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('gdpr.yourRights.rightToErasureDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('gdpr.yourRights.rightToDataPortability')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('gdpr.yourRights.rightToDataPortabilityDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('gdpr.yourRights.rightToObject')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('gdpr.yourRights.rightToObjectDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">{t('gdpr.yourRights.rightToRestriction')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            {t('gdpr.yourRights.rightToRestrictionDesc')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteIcon color="primary" />
                    {t('gdpr.dataRetention.title')}
                </Typography>
                <Typography variant="body1">
                    {t('gdpr.dataRetention.description')}
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataRetention.accountInfo')}
                            secondary={t('gdpr.dataRetention.accountInfoDesc')}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataRetention.orderHistory')}
                            secondary={t('gdpr.dataRetention.orderHistoryDesc')}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataRetention.paymentInfo')}
                            secondary={t('gdpr.dataRetention.paymentInfoDesc')}
                        />
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    {t('gdpr.dataSecurity.title')}
                </Typography>
                <Typography variant="body1">
                    {t('gdpr.dataSecurity.description')}
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataSecurity.encryption')}
                            secondary={t('gdpr.dataSecurity.encryptionDesc')}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataSecurity.accessControls')}
                            secondary={t('gdpr.dataSecurity.accessControlsDesc')}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataSecurity.securityAssessments')}
                            secondary={t('gdpr.dataSecurity.securityAssessmentsDesc')}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={t('gdpr.dataSecurity.dataBreachProcedures')}
                            secondary={t('gdpr.dataSecurity.dataBreachProceduresDesc')}
                        />
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('gdpr.internationalTransfers.title')}
                </Typography>
                <Typography variant="body1">
                    {t('gdpr.internationalTransfers.description')}
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('gdpr.cookies.title')}
                </Typography>
                <Typography variant="body1">
                    {t('gdpr.cookies.description')}
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('gdpr.dpoContact.title')}
                </Typography>
                <Typography variant="body1">
                    {t('gdpr.dpoContact.description')}
                </Typography>
                <Box sx={{ ml: 2 }}>
                    <Typography variant="body1">
                        <strong>{t('gdpr.dpoContact.email')}:</strong> info@purpleworld.tr
                    </Typography>
                    <Typography variant="body1">
                        <strong>{t('gdpr.dpoContact.address')}:</strong> Hacettepe Atatepe Otoparkı, Purple World, Ankara / Türkiye
                    </Typography>
                    <Typography variant="body1">
                        <strong>{t('gdpr.dpoContact.phone')}:</strong> +90 123 456 7890
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('gdpr.complaints.title')}
                </Typography>
                <Typography variant="body1">
                    {t('gdpr.complaints.description')}
                </Typography>
            </Box>

            <Box sx={{ mt: 4, bgcolor: 'primary.light', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {t('gdpr.lastUpdated')}
                </Typography>
            </Box>
        </>
    );
    // ai-gen end
};

export default GDPRPage;