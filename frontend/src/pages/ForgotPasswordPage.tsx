import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    Alert
} from "@mui/material";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { requestPasswordReset } from "../utils/api";
import { useTranslation } from 'react-i18next';

export const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);

        // Reset email validation errors when email field changes
        if (emailError) {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        // Hide error when input changes
        if (showError) {
            setShowError(false);
        }
    };

    const validateInputs = (): boolean => {
        let isValid = true;

        // Email validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMessage(t('login.validEmail') || 'Please enter a valid email');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateInputs()) {
            return;
        }

        setError("");
        setLoading(true);

        try {
            await requestPasswordReset(email);
            setSent(true);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                t('forgotPassword.error') ||
                "Something went wrong.";

            setError(errorMessage);
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    // Success state view
    if (sent) {
        return (
            <Container sx={{ px: { xs: 1, md: 4 }, py: 4 }}>
                {/* Gradient background */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '360px',
                        background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                        zIndex: 0
                    }}
                />

                {/* Content */}
                <Container
                    maxWidth="sm"
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Paper sx={{
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        px: { xs: 4, md: 8 },
                        py: { xs: 4, md: 6 },
                        width: '100%',
                    }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {t('forgotPassword.emailSent') || 'Password reset email sent!'}
                        </Alert>

                        <Typography>
                            {t('forgotPassword.checkInbox') || 'If an account exists for'} <strong>{email}</strong>, {t('forgotPassword.resetLinkSent') || "you'll receive a password reset link shortly. Please check your inbox (and spam folder)."}
                        </Typography>

                        <Button
                            component={Link}
                            to="/login"
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2, py: 2 }}
                        >
                            {t('forgotPassword.backToLogin') || 'Back to Login'}
                        </Button>
                    </Paper>
                </Container>
            </Container>
        );
    }

    return (
        <Container sx={{ px: { xs: 1, md: 4 }, py: 4 }}>
            {/* Gradient background */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '360px',
                    background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                    zIndex: 0
                }}
            />

            {/* Form content */}
            <Container
                maxWidth="sm"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                {/* Forgot Password Area */}
                <Paper component="form" noValidate onSubmit={handleSubmit} sx={{
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    px: { xs: 4, md: 8 },
                    py: { xs: 4, md: 10 },
                    width: '100%',
                }}>
                    <Typography variant="h1" sx={{ fontSize: 36, fontWeight: 600, textAlign: 'center' }}>
                        {t('forgotPassword.title') || 'Forgot Password'}
                    </Typography>

                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        {t('forgotPassword.instructions') || 'Enter your email address below and we\'ll send you instructions to reset your password.'}
                    </Typography>

                    {/* Error Alert */}
                    {showError && (
                        <Alert
                            severity="error"
                            onClose={() => setShowError(false)}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <FormControl>
                        <FormLabel htmlFor="email">{t('login.email') || 'Email'}</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="email"
                            type="email"
                            name="email"
                            placeholder={t('login.emailPlaceholder') || 'Enter your email'}
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="standard"
                            margin="dense"
                            color={emailError ? 'error' : 'primary'}
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ py: 2, mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : (t('forgotPassword.sendResetLink') || 'Send Reset Link')}
                    </Button>

                    <Typography
                        component={Link}
                        to="/login"
                        color="inherit"
                        sx={{ alignSelf: 'center', textDecoration: 'none' }}
                    >
                        {t('forgotPassword.backToLogin') || 'Back to Login'}
                    </Typography>
                </Paper>
            </Container>
        </Container>
    );
};