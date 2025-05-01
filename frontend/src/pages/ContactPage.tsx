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

type InquiryType = 'general' | 'complaint' | 'suggestion' | 'restaurant' | 'courier';

const ContactPage: React.FC = () => {
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

    const handleCloseSnackbar = () => {
        setShowSuccess(false);
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
                                Get in Touch
                            </Typography>
                            <Typography variant="body2">
                                We'd love to hear from you
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
                                            Our Location
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            123 Food Street, Hungry City, 06800
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
                                            Phone Number
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            +90 (312) 123 45677
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
                                            Email Address
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            support@purpleworld.tr
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>

                            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Business Hours
                                </Typography>
                                <Typography variant="body2">
                                    Monday - Friday: 9:00 AM - 8:00 PM
                                </Typography>
                                <Typography variant="body2">
                                    Saturday - Sunday: 10:00 AM - 6:00 PM
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right side - Contact Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ borderRadius: 4, p: 4, }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Send Us a Message
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fill out the form below and we'll get back to you as soon as possible
                        </Typography>

                        {showSuccess && (
                            <Alert
                                severity="success"
                                sx={{ mb: 3 }}
                                onClose={() => setShowSuccess(false)}
                            >
                                Your message has been successfully sent! We will get back to you soon.
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="name"
                                        label="Your Name"
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
                                        label="Email Address"
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
                                        label="Subject"
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
                                        <InputLabel id="inquiry-type-label">Inquiry Type</InputLabel>
                                        <Select
                                            labelId="inquiry-type-label"
                                            id="inquiry-type"
                                            value={inquiryType}
                                            label="Inquiry Type"
                                            onChange={handleInquiryTypeChange}
                                        >
                                            <MenuItem value="general">General Inquiry</MenuItem>
                                            <MenuItem value="complaint">Complaint</MenuItem>
                                            <MenuItem value="suggestion">Suggestion</MenuItem>
                                            <MenuItem value="restaurant">Restaurant Related</MenuItem>
                                            <MenuItem value="courier">Courier Related</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="message"
                                        label="Your Message"
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
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
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
                            Our Location
                        </Typography>
                        <Typography variant="body2">
                            Visit us at Hacettepe Atatepe Otoparkı
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