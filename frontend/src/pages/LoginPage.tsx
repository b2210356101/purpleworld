import { Box, Button, Container, FormControl, FormLabel, IconButton, InputAdornment, Paper, TextField, Typography, CircularProgress, Alert } from "@mui/material";
import { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Phishing from "@mui/icons-material/Phishing";
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { loginUser } from '../utils/api';
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/slices/authSlice";
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [loginDisabled, setLoginDisabled] = useState(false);
    
    const lastEmail = useRef('');
    const lastPassword = useRef('');

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (loginDisabled) {
            const emailInput = document.getElementById('email') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            
            const currentEmail = emailInput?.value || '';
            const currentPassword = passwordInput?.value || '';
            
            // Re-enable login button if either email or password has changed
            if (currentEmail !== lastEmail.current || currentPassword !== lastPassword.current) {
                setLoginDisabled(false);
                setShowError(false); // Hide error when input changes
            }
        }
        
        // Reset email validation errors when email field changes
        if (event.target.id === 'email' && emailError) {
            setEmailError(false);
            setEmailErrorMessage('');
        }
    };

    const validateInputs = (): boolean => {
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const email = emailInput.value;

        let isValid = true;

        // Email validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMessage(t('login.validEmail'));
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateInputs()) {
            const form = event.currentTarget;
            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
            const password = (form.elements.namedItem('password') as HTMLInputElement).value;

            lastEmail.current = email;
            lastPassword.current = password;

            try {
                setLoading(true);

                const data = await loginUser(email, password);

                console.log(data)

                dispatch(login({
                    token: data.token,
                    role: data.role,
                    username: data.username,
                    profileImage: data.profileImage
                }));

                navigate('/');
            } catch (err: any) {
                console.log("LOGIN ERROR:", err);

                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    t('login.loginError');

                setError(errorMessage);
                setShowError(true);
                
                // Disable login button until credentials change
                setLoginDisabled(true);
            }
             finally {
                setLoading(false);
            }
        }
    };

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
                        {t('login.title')}
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

                    {/* Login Form */}
                    <FormControl>
                        <FormLabel htmlFor="email">{t('login.email')}</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="email"
                            type="email"
                            name="email"
                            placeholder={t('login.emailPlaceholder')}
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="standard"
                            margin="dense"
                            color={emailError ? 'error' : 'primary'}
                            onChange={handleInputChange}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">{t('login.password')}</FormLabel>
                        <TextField
                            name="password"
                            placeholder={t('login.passwordPlaceholder')}
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            required
                            fullWidth
                            variant="standard"
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
                        {t('login.forgotPassword')}
                        <Phishing fontSize="small" />
                    </Typography>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading || loginDisabled}
                        sx={{ py: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : t('login.signIn')}
                    </Button>

                    <Typography
                        component={Link}
                        to="/register"
                        color="inherit"
                        sx={{ alignSelf: 'center', textDecoration: 'none' }}
                    >
                        {t('login.noAccount')}
                    </Typography>
                </Paper>
            </Container>
        </Container >
    );
};

export default LoginPage;