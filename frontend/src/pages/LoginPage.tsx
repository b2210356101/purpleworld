import { Box, Button, Container, FormControl, FormLabel, IconButton, InputAdornment, Paper, TextField, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Phishing from "@mui/icons-material/Phishing";
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { loginUser } from '../utils/api';
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/slices/authSlice";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    // Password status tracking
    const [passwordChanged, setPasswordChanged] = useState(true);
    const [lastPassword, setLastPassword] = useState('');
    const [failedAttempt, setFailedAttempt] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const validateInputs = (): boolean => {
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const email = emailInput.value;

        let isValid = true;

        // Email validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        return isValid;
    };

    // Handle password changes
    // ai-gen start (claude sonnet 3.7, 0)
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;

        // If there was a failed attempt and the password is different from last attempt
        if (failedAttempt && newPassword !== lastPassword) {
            setPasswordChanged(true);
        } else if (failedAttempt && newPassword === lastPassword) {
            setPasswordChanged(false);
        }
    };
    // ai-gen end

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateInputs()) {
            const form = event.currentTarget;
            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
            const password = (form.elements.namedItem('password') as HTMLInputElement).value;

            // Store the current password attempt
            setLastPassword(password);

            try {
                setLoading(true);

                const data = await loginUser(email, password);

                // Redux action dispatch
                dispatch(login({
                    token: data.token,
                    roleType: data.role,
                }));

                navigate('/');
            } catch (err) {
                // Mark as failed attempt and require password change
                // ai-gen start (claude sonnet 3.7, 0)
                setFailedAttempt(true);
                setPasswordChanged(false);
                // ai-gen end

                setError('Email or password is incorrect.');
                setShowError(true);
            } finally {
                setLoading(false);
            }
        }
    };

    // Determine if login button should be disabled
    const isLoginDisabled = loading || (failedAttempt && !passwordChanged);

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

            {/* Login content */}
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

                {/* Login Area */}
                <Paper component="form" noValidate onSubmit={handleSubmit} sx={{
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    px: { xs: 4, md: 8 },
                    py: { xs: 4, md: 10 },
                    width: '100%',
                }}>

                    <Typography variant="h1" sx={{ fontSize: 36, fontWeight: 600, textAlign: 'center', }}>
                        Login & Savor the Flavor
                    </Typography>

                    {/* Login Form */}
                    <FormControl>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="standard"
                            margin="dense"
                            color={emailError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            name="password"
                            placeholder="••••••"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            required
                            fullWidth
                            variant="standard"
                            onChange={handlePasswordChange}
                            margin="dense"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClickShowPassword}>
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                    </FormControl>

                    <Typography
                        component={Link}
                        to="/forgot-password"
                        color="inherit"
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            textDecoration: 'none',
                            mt: -2,
                        }}
                    >
                        Forget Password?
                        <Phishing fontSize="small" />
                    </Typography>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoginDisabled}
                        sx={{ py: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign in'}
                    </Button>

                    <Typography
                        component={Link}
                        to="/register"
                        color="inherit"
                        sx={{ alignSelf: 'center', textDecoration: 'none' }}
                    >
                        Don't have an account? Register now.
                    </Typography>
                </Paper>
            </Container>

            {/* Error Snackbar */}
            <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)}>
                <Alert onClose={() => setShowError(false)} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Container >
    );
};

export default LoginPage;