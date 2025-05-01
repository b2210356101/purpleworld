import React from 'react';
import {
    Container,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Paper,
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

const GDPRPage: React.FC = () => {
    // ai-gen start (claude 3.7 sonnet)
    return (
        <>
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    GDPR Compliance
                </Typography>
            </Box>

            <Typography variant="body1">
                At Hungry Users Food Delivery System (HU-FDS), we are committed to protecting
                your privacy and ensuring that your personal data is handled in accordance
                with the General Data Protection Regulation (GDPR). This page outlines our
                approach to data protection and your rights under the GDPR.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DataUsageIcon color="primary" />
                            Data We Collect
                        </Typography>
                        <Typography variant="body1">
                            We collect and process the following categories of personal data:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Account Information"
                                    secondary="Name, email address, phone number, and user credentials"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Delivery Information"
                                    secondary="Delivery addresses, delivery preferences, and location data"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Payment Information"
                                    secondary="Payment method details (processed through secure payment processors)"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <VerifiedUserIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Usage Data"
                                    secondary="Order history, restaurant preferences, reviews, and ratings"
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GavelIcon color="primary" />
                            Legal Basis for Processing
                        </Typography>
                        <Typography variant="body1">
                            We process your personal data based on the following legal grounds:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Contract Performance"
                                    secondary="Processing necessary to fulfill our service contract with you"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Legitimate Interests"
                                    secondary="Improving our services, ensuring security, and business analytics"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Consent"
                                    secondary="Marketing communications and optional features (where you have provided explicit consent)"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Legal Obligations"
                                    secondary="Compliance with applicable laws and regulations"
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
            </Grid>

            <Stack gap={2} sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrivacyTipIcon color="primary" />
                    Your Rights Under GDPR
                </Typography>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Right to Access</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            You have the right to request a copy of the personal data we hold about you.
                            You can access this information by logging into your account or by contacting our
                            Data Protection Officer. We will provide this information within 30 days of your request.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Right to Rectification</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            If you believe that any personal data we hold about you is inaccurate or incomplete,
                            you can update your information directly through your account settings or contact us
                            to correct this information.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Right to Erasure</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            You have the right to request the deletion of your personal data under certain circumstances,
                            such as when the data is no longer necessary for the purposes for which it was collected.
                            You can delete your account through the profile settings or contact us to request erasure of your data.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Right to Data Portability</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            You have the right to receive your personal data in a structured, commonly used, and
                            machine-readable format, and to transmit this data to another controller without hindrance
                            from us. You can request a copy of your data for portability purposes at any time.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Right to Object</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            You have the right to object to the processing of your personal data based on legitimate
                            interests or for direct marketing purposes. If you wish to object to data processing,
                            please contact our Data Protection Officer.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">Right to Restriction of Processing</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">
                            You can request that we restrict the processing of your personal data under certain conditions,
                            such as if you contest the accuracy of the data or if the processing is unlawful.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteIcon color="primary" />
                    Data Retention
                </Typography>
                <Typography variant="body1">
                    We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected,
                    including legal, accounting, or reporting requirements. Different types of data may be retained for different periods:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Account Information"
                            secondary="Retained while your account is active; deleted or anonymized within 30 days of account closure"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Order History"
                            secondary="Retained for 3 years for business analytics and customer service purposes"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Payment Information"
                            secondary="Retained only as long as necessary to process transactions and handle refunds"
                        />
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    Data Security
                </Typography>
                <Typography variant="body1">
                    We implement appropriate technical and organizational measures to protect your personal data against
                    unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Encryption"
                            secondary="All data transmission between your device and our servers is encrypted using SSL/TLS protocols"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Access Controls"
                            secondary="Strict access controls and authentication mechanisms for all personnel accessing user data"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Regular Security Assessments"
                            secondary="Periodic security assessments and penetration testing to identify and address vulnerabilities"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Data Breach Procedures"
                            secondary="Comprehensive data breach detection, reporting, and notification procedures"
                        />
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    International Data Transfers
                </Typography>
                <Typography variant="body1">
                    HU-FDS primarily processes and stores data within the European Economic Area (EEA).
                    However, when data is transferred outside the EEA, we ensure that appropriate safeguards
                    are in place, such as Standard Contractual Clauses approved by the European Commission
                    or other lawful transfer mechanisms.
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Cookies and Tracking Technologies
                </Typography>
                <Typography variant="body1">
                    Our platform uses cookies and similar tracking technologies to enhance your browsing experience,
                    analyze site traffic, and personalize content. You can manage your cookie preferences through
                    your browser settings or through our cookie consent tool that appears when you first visit our site.
                </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Data Protection Officer Contact
                </Typography>
                <Typography variant="body1">
                    If you have any questions about our data protection practices or wish to exercise your GDPR rights,
                    please contact our Data Protection Officer:
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

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Complaints
                </Typography>
                <Typography variant="body1">
                    If you are not satisfied with our response to your concerns, you have the right to lodge a
                    complaint with the relevant data protection supervisory authority in your country of residence.
                </Typography>
            </Box>

            <Box sx={{ mt: 4, bgcolor: 'primary.light', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Last Updated: April 29, 2025
                </Typography>
            </Box>
        </>
    );
    // ai-gen end
};

export default GDPRPage;