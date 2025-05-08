import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions, DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { checkEmailExists, registerCustomer, sendVerificationCode, verifyEmailCode } from "../../utils/api";
import { useTranslation } from 'react-i18next';

const RegisterCustomer = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [generalError, setGeneralError] = useState("");

    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [acceptTermsError, setAcceptTermsError] = useState(false);

    const [firstNameErrorMsg, setFirstNameErrorMsg] = useState("");
    const [lastNameErrorMsg, setLastNameErrorMsg] = useState("");
    const [phoneErrorMsg, setPhoneErrorMsg] = useState("");
    const [emailErrorMsg, setEmailErrorMsg] = useState("");
    const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
    const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState("");

    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    inputRefs.current = Array(6).fill(null).map((_, i) => inputRefs.current[i] || null);


    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const validateInputs = (): boolean => {
        const firstName =
            (document.getElementById("firstName") as HTMLInputElement)?.value || "";
        const lastName =
            (document.getElementById("lastName") as HTMLInputElement)?.value || "";
        const phone =
            (document.getElementById("phone") as HTMLInputElement)?.value || "";
        const email =
            (document.getElementById("email") as HTMLInputElement)?.value || "";
        const password =
            (document.getElementById("password") as HTMLInputElement)?.value || "";
        const confirmPassword =
            (document.getElementById("confirmPassword") as HTMLInputElement)?.value ||
            "";

        let isValid = true;

        if (!firstName) {
            setFirstNameError(true);
            setFirstNameErrorMsg(t('register.customer.firstNameRequired'));
            isValid = false;
        } else {
            setFirstNameError(false);
            setFirstNameErrorMsg("");
        }

        if (!lastName) {
            setLastNameError(true);
            setLastNameErrorMsg(t('register.customer.lastNameRequired'));
            isValid = false;
        } else {
            setLastNameError(false);
            setLastNameErrorMsg("");
        }

        if (!/^\d{10}$/.test(phone)) {
            setPhoneError(true);
            setPhoneErrorMsg(t('register.customer.phoneRequired'));
            isValid = false;
        } else {
            setPhoneError(false);
            setPhoneErrorMsg("");
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMsg(t('register.customer.emailRequired'));
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMsg("");
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_])[A-Za-z\d!@#$%^&*_]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            setPasswordError(true);
            setPasswordErrorMsg(t('register.validation.passwordRequirements'));
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMsg("");
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError(true);
            setConfirmPasswordErrorMsg(t('register.validation.passwordsDoNotMatch'));
            isValid = false;
        } else {
            setConfirmPasswordError(false);
            setConfirmPasswordErrorMsg("");
        }

        if (!acceptTerms) {
            setAcceptTermsError(true);
            isValid = false;
        } else {
            setAcceptTermsError(false);
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGeneralError("");
        setVerificationError("");

        if (!validateInputs()) return;

        const data = new FormData(e.currentTarget);
        const formDataObj = {
            first_Name: data.get("firstName") as string,
            last_Name: data.get("lastName") as string,
            phone_Number: data.get("phone") as string,
            email: data.get("email") as string,
            password: data.get("password") as string,
        };

        try {
            setIsSendingCode(true);

            const exists = await checkEmailExists(formDataObj.email);
            if (exists) {
                setEmailError(true);
                setEmailErrorMsg(t('register.validation.emailExists'));
                return;
            }

            await sendVerificationCode(formDataObj.email);
            setFormData(formDataObj);
            setShowVerificationDialog(true);
        } catch (err: any) {
            console.error("Code send error:", err);
            const errorMessage = err.response?.data?.message || err.message || "";
            if (errorMessage.includes("already exists")) {
                setEmailError(true);
                setEmailErrorMsg(t('register.validation.emailExists'));
            } else {
                setGeneralError(t('register.validation.generalError'));
            }
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        setVerificationError("");

        if (!formData) {
            setVerificationError(t('register.validation.missingFormData'));
            return;
        }

        try {
            const isValid = await verifyEmailCode(formData.email, verificationCode);
            if (!isValid) {
                setVerificationError(t('register.validation.invalidVerificationCode'));
                return;
            }

            await registerCustomer(formData);
            setShowVerificationDialog(false);
            navigate("/login");
        } catch (err: any) {
            console.error("Final registration error:", err);
            setVerificationError(t('register.validation.verificationError'));
        }
    };

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newDigits = [...codeDigits];
        newDigits[index] = value;
        setCodeDigits(newDigits);
        setVerificationCode(newDigits.join(""));

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (event: React.ClipboardEvent) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData("text/plain").trim();

        // Check if pasted content contains only digits
        if (/^\d+$/.test(pastedData)) {
            // Take only the first 6 digits (or fewer if the pasted text is shorter)
            const digits = pastedData.slice(0, 6).split("");

            // Create a new array with the pasted digits and fill remaining positions with empty strings
            const newDigits = [...digits, ...Array(6 - digits.length).fill("")];

            // Update state with new digits
            setCodeDigits(newDigits);
            setVerificationCode(newDigits.join(""));

            // Focus the next empty input field or the last one if all are filled
            const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
            inputRefs.current[nextEmptyIndex]?.focus();
        }
    };

    return (
        <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 500, // Prevents the form from being too wide
                mx: "auto", // Centers horizontally
                px: { xs: 2, sm: 4 }, // Padding left/right based on screen size
                py: 4,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                borderRadius: 2,
                width: "100%", // Allows responsive shrinking
                boxSizing: "border-box",
            }}
        >
            <Typography
                variant="h4"
                fontWeight={600}
                textAlign="center"
                color="primary"
            >
                {t('register.customer.title')}
            </Typography>

            {generalError && (
                <Typography color="error" variant="body2" textAlign="center">
                    {generalError}
                </Typography>
            )}

            <FormControl>
                <FormLabel htmlFor="firstName">{t('register.common.firstName')}</FormLabel>
                <TextField
                    id="firstName"
                    name="firstName"
                    error={firstNameError}
                    helperText={firstNameErrorMsg}
                    fullWidth
                    variant="standard"
                    margin="dense"
                    autoComplete="given-name"
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="lastName">{t('register.common.lastName')}</FormLabel>
                <TextField
                    id="lastName"
                    name="lastName"
                    error={lastNameError}
                    helperText={lastNameErrorMsg}
                    fullWidth
                    variant="standard"
                    margin="dense"
                    autoComplete="family-name"
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="phone">{t('register.common.phone')}</FormLabel>
                <TextField
                    id="phone"
                    name="phone"
                    placeholder={t('register.common.phonePlaceholder')}
                    error={phoneError}
                    helperText={phoneErrorMsg}
                    fullWidth
                    variant="standard"
                    margin="dense"
                    inputProps={{ maxLength: 10 }}
                    autoComplete="tel"
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="email">{t('register.common.email')}</FormLabel>
                <TextField
                    id="email"
                    name="email"
                    placeholder={t('register.common.emailPlaceholder')}
                    type="email"
                    error={emailError}
                    helperText={emailErrorMsg}
                    fullWidth
                    variant="standard"
                    margin="dense"
                    autoComplete="email"
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="password">{t('register.common.password')}</FormLabel>
                <TextField
                    id="password"
                    name="password"
                    placeholder={t('register.common.passwordPlaceholder')}
                    type={showPassword ? "text" : "password"}
                    error={passwordError}
                    helperText={passwordErrorMsg}
                    fullWidth
                    variant="standard"
                    margin="dense"
                    autoComplete="new-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="confirmPassword">{t('register.common.confirmPassword')}</FormLabel>
                <TextField
                    id="confirmPassword"
                    name="passwordConfirmation"
                    placeholder={t('register.common.passwordPlaceholder')}
                    type={showPassword ? "text" : "password"}
                    error={confirmPasswordError}
                    helperText={confirmPasswordErrorMsg}
                    fullWidth
                    variant="standard"
                    margin="dense"
                    autoComplete="new-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </FormControl>

            <FormControl required error={acceptTermsError}>
                <FormControlLabel
                    control={
                        <Checkbox
                            id="acceptTerms"
                            name="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            sx={{ color: theme.palette.primary.main }}
                        />
                    }
                    label={
                        <Typography variant="body2" id="terms-label">
                            {t('register.common.termsAndConditions')}
                        </Typography>
                    }
                />
            </FormControl>

            {/* Submit Button */}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSendingCode}
                sx={{
                    py: 2,
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                    },
                }}
            >
                {isSendingCode ? (
                    <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={16} />
                        {t('register.common.sendingCode')}
                    </Box>
                ) : (
                    t('register.common.registerButton')
                )}
            </Button>

            <Typography
                component={Link}
                to="/login"
                sx={{
                    alignSelf: "center",
                    textDecoration: "none",
                    color: theme.palette.text.primary,
                }}
            >
                {t('register.common.alreadyHaveAccount')}
            </Typography>
            {/* Dialog: Verification Code Popup */}
            <Dialog
                open={showVerificationDialog}
                onClose={() => setShowVerificationDialog(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>{t('register.common.verificationCodeTitle')}</DialogTitle>
                <DialogContent>
                    {verificationError && (
                        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                            {verificationError}
                        </Typography>
                    )}
                    <Box display="flex" justifyContent="center" gap={1}>
                        {codeDigits.map((digit, index) => (
                            <TextField
                                key={index}
                                inputRef={(el) => (inputRefs.current[index] = el)}
                                value={digit}
                                onChange={(e) => handleDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined} // Only add paste handler to first input
                                inputProps={{
                                    maxLength: 1,
                                    style: {
                                        width: "3rem",
                                        height: "3rem",
                                        textAlign: "center",
                                        fontSize: "1.5rem",
                                    },
                                }}
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </DialogContent>


                <DialogActions sx={{ pr: 3, pb: 2 }}>
                    <Button onClick={() => setShowVerificationDialog(false)}>
                        {t('register.common.cancelButton')}
                    </Button>
                    <Button variant="contained" onClick={handleVerifyAndRegister}>
                        {t('register.common.verifyButton')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RegisterCustomer;