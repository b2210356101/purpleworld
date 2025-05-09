import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    FormControl,
    MenuItem,
    Select,
    InputLabel,
    SelectChangeEvent,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    LocationOn,
    Phone,
    Email,
    Send,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

type InquiryType = 'general' | 'complaint' | 'suggestion' | 'restaurant' | 'courier';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [inquiryType, setInquiryType] = useState<InquiryType>('general');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);

    const handleInquiryTypeChange = (event: SelectChangeEvent<InquiryType>) => {
        setInquiryType(event.target.value as InquiryType);
    };

    // Handle form submission
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log({ name, email, subject, message, inquiryType });

            // Reset form fields after submission
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            setInquiryType('general');

            setIsSubmitting(false);
            setShowSuccess(true);
        }, 1000);
    };

    return (
        <Box>
            {/* Contact Information & Form Section */}
            <Grid container spacing={4} sx={{ mt: 6 }}>
                {/* Left side - Contact Information */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        height: '100%',
                    }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
                            <Typography variant="h5" fontWeight="bold">
                                {t('contact.info.title')}
                            </Typography>
                            <Typography variant="body2">
                                {t('contact.info.subtitle')}
                            </Typography>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <Stack spacing={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        bgcolor: 'primary.light',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mr: 2,
                                        color: 'primary.main'
                                    }}>
                                        <LocationOn />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {t('contact.info.location.title')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('contact.info.location.address')}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        bgcolor: 'primary.light',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mr: 2,
                                        color: 'primary.main'
                                    }}>
                                        <Phone />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {t('contact.info.phone.title')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('contact.info.phone.number')}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        bgcolor: 'primary.light',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mr: 2,
                                        color: 'primary.main'
                                    }}>
                                        <Email />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {t('contact.info.email.title')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('contact.info.email.address')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>

                            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    {t('contact.info.hours.title')}
                                </Typography>
                                <Typography variant="body2">
                                    {t('contact.info.hours.weekdays')}
                                </Typography>
                                <Typography variant="body2">
                                    {t('contact.info.hours.weekends')}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right side - Contact Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ borderRadius: 4, p: 4, }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {t('contact.form.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('contact.form.subtitle')}
                        </Typography>

                        {showSuccess && (
                            <Alert
                                severity="success"
                                sx={{ mb: 3 }}
                                onClose={() => setShowSuccess(false)}
                            >
                                {t('contact.form.successMessage')}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="name"
                                        label={t('contact.form.fields.name')}
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        variant="outlined"
                                        margin="normal"
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label={t('contact.form.fields.email')}
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        variant="outlined"
                                        margin="normal"
                                        type="email"
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="subject"
                                        label={t('contact.form.fields.subject')}
                                        name="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        variant="outlined"
                                        margin="normal"
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth margin="normal" disabled={isSubmitting}>
                                        <InputLabel id="inquiry-type-label">{t('contact.form.fields.inquiryType')}</InputLabel>
                                        <Select
                                            labelId="inquiry-type-label"
                                            id="inquiry-type"
                                            value={inquiryType}
                                            label={t('contact.form.fields.inquiryType')}
                                            onChange={handleInquiryTypeChange}
                                        >
                                            <MenuItem value="general">{t('contact.form.inquiryTypes.general')}</MenuItem>
                                            <MenuItem value="complaint">{t('contact.form.inquiryTypes.complaint')}</MenuItem>
                                            <MenuItem value="suggestion">{t('contact.form.inquiryTypes.suggestion')}</MenuItem>
                                            <MenuItem value="restaurant">{t('contact.form.inquiryTypes.restaurant')}</MenuItem>
                                            <MenuItem value="courier">{t('contact.form.inquiryTypes.courier')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="message"
                                        label={t('contact.form.fields.message')}
                                        name="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        variant="outlined"
                                        margin="normal"
                                        multiline
                                        rows={4}
                                        disabled={isSubmitting}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        endIcon={isSubmitting ? null : <Send />}
                                        sx={{ mt: 2 }}
                                        disabled={isSubmitting || !name || !email || !message}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                                {t('contact.form.sending')}
                                            </>
                                        ) : (
                                            t('contact.form.sendButton')
                                        )}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Map Section */}
            <Box sx={{ my: 4 }}>
                <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                            {t('contact.info.location.mapTitle')}
                        </Typography>
                        <Typography variant="body2">
                            {t('contact.info.location.mapSubtitle')}
                        </Typography>
                    </Box>

                    {/* Google Maps */}
                    <Box
                        sx={{
                            width: '100%',
                            height: '400px'
                        }}
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d765.5711969953162!2d32.73126069640683!3d39.86785833995783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1satatepe%20!5e0!3m2!1str!2str!4v1745659204746!5m2!1str!2str"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                        />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ContactPage;