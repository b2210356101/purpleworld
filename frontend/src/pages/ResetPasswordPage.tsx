import { 
    Box, 
    Button, 
    Container, 
    FormControl, 
    FormLabel, 
    IconButton, 
    InputAdornment, 
    Paper, 
    TextField, 
    Typography, 
    CircularProgress, 
    Alert 
} from "@mui/material";
import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from "../utils/api";
import { useTranslation } from 'react-i18next';

export const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const [search] = useSearchParams();
    const token = search.get("token") || "";
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [confirmError, setConfirmError] = useState(false);
    const [confirmErrorMessage, setConfirmErrorMessage] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
        
        // Reset validation errors when field changes
        if (passwordError) {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }
        
        // Hide error when input changes
        if (showError) {
            setShowError(false);
        }
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value);
        
        // Reset validation errors when field changes
        if (confirmError) {
            setConfirmError(false);
            setConfirmErrorMessage('');
        }
        
        // Hide error when input changes
        if (showError) {
            setShowError(false);
        }
    };

    const validateInputs = (): boolean => {
        let isValid = true;

        // Password validation - using the same rules as in RegisterCustomer
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_])[A-Za-z\d!@#$%^&*_]{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            setPasswordError(true);
            setPasswordErrorMessage(t('resetPassword.passwordRequirements') || 'Password must be at least 8 characters, include uppercase and lowercase letters, a number, and a special character');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        // Confirm password validation
        if (newPassword !== confirmPassword) {
            setConfirmError(true);
            setConfirmErrorMessage(t('resetPassword.passwordsDoNotMatch') || 'Passwords do not match');
            isValid = false;
        } else {
            setConfirmError(false);
            setConfirmErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        
        try {
            await resetPassword(token, newPassword);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            const errorMessage = 
                err?.response?.data?.message || 
                err?.message || 
                t('resetPassword.invalidToken') || 
                "Invalid or expired token.";
            
            setError(errorMessage);
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    // Success state view
    if (success) {
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
                            {t('resetPassword.success') || 'Your password has been updated!'}
                        </Alert>
                        
                        <Typography>
                            {t('resetPassword.redirecting') || 'Redirecting to'} <strong>{t('login.title') || 'Login'}</strong>…
                        </Typography>
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
                {/* Reset Password Area */}
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
                        {t('resetPassword.title') || 'Set New Password'}
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
                        <FormLabel htmlFor="new-password">{t('resetPassword.newPassword') || 'New Password'}</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            name="new-password"
                            placeholder={t('resetPassword.newPasswordPlaceholder') || 'Enter your new password'}
                            required
                            fullWidth
                            variant="standard"
                            margin="dense"
                            color={passwordError ? 'error' : 'primary'}
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel htmlFor="confirm-password">{t('resetPassword.confirmPassword') || 'Confirm Password'}</FormLabel>
                        <TextField
                            error={confirmError}
                            helperText={confirmErrorMessage}
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirm-password"
                            placeholder={t('resetPassword.confirmPasswordPlaceholder') || 'Confirm your new password'}
                            required
                            fullWidth
                            variant="standard"
                            margin="dense"
                            color={confirmError ? 'error' : 'primary'}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading || !newPassword || !confirmPassword}
                        sx={{ py: 2, mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : (t('resetPassword.resetButton') || 'Reset Password')}
                    </Button>

                    <Typography
                        component={Link}
                        to="/login"
                        color="inherit"
                        sx={{ alignSelf: 'center', textDecoration: 'none' }}
                    >
                        {t('resetPassword.backToLogin') || 'Back to Login'}
                    </Typography>
                </Paper>
            </Container>
        </Container>
    );
};