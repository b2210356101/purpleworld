import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
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
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
    checkEmailExists,
    checkTaxIdExists,
    registerCustomer,
    registerRestaurant,
    sendVerificationCode,
    verifyEmailCode,
} from "../../utils/api";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useTranslation } from 'react-i18next';

// Track if the script has been loaded to prevent multiple loads
const GOOGLE_MAPS_API_KEY = "AIzaSyBkEQfPxLwjzhWwPshlQAdIuWTHlk80Vls";
let googleMapsScriptLoaded = false;

declare global {
    interface Window {
        initMap: () => void;
        google: any;
    }
}

const RegisterRestaurant = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapObject, setMapObject] = useState<google.maps.Map | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
        null
    );
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [base64Image, setBase64Image] = useState<string>("");

    // Error states for each field
    const [managerNameError, setManagerNameError] = useState(false);
    const [managerLastNameError, setManagerLastNameError] = useState(false);
    const [managerPhoneError, setManagerPhoneError] = useState(false);
    const [restaurantNameError, setRestaurantNameError] = useState(false);
    const [restaurantAddressError, setRestaurantAddressError] = useState(false);
    const [taxIdError, setTaxIdError] = useState(false);
    const [buildingNumberError, setBuildingNumberError] = useState(false);
    const [apartmentNumberError, setApartmentNumberError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [locationError, setLocationError] = useState(false);
    const [acceptTermsError, setAcceptTermsError] = useState(false);
    const [generalError, setGeneralError] = useState<string>("");

    // Error messages for each field
    const [managerNameErrorMsg, setManagerNameErrorMsg] = useState("");
    const [managerLastNameErrorMsg, setManagerLastNameErrorMsg] = useState("");
    const [managerPhoneErrorMsg, setManagerPhoneErrorMsg] = useState("");
    const [restaurantNameErrorMsg, setRestaurantNameErrorMsg] = useState("");
    const [restaurantAddressErrorMsg, setRestaurantAddressErrorMsg] =
        useState("");
    const [taxIdErrorMsg, setTaxIdErrorMsg] = useState("");
    const [buildingNumberErrorMsg, setBuildingNumberErrorMsg] = useState("");
    const [apartmentNumberErrorMsg, setApartmentNumberErrorMsg] = useState("");
    const [emailErrorMsg, setEmailErrorMsg] = useState("");
    const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
    const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState("");
    const [locationErrorMsg, setLocationErrorMsg] = useState("");

    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    inputRefs.current = Array(6)
        .fill(null)
        .map((_, i) => inputRefs.current[i] || null);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    // Google Maps initialization
    useEffect(() => {
        if (googleMapsScriptLoaded) {
            if (window.google && mapRef.current && !mapObject) {
                initializeMap();
            }
            return;
        }

        window.initMap = () => {
            initializeMap();
        };

        const loadGoogleMapsScript = () => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                googleMapsScriptLoaded = true;
            };
            document.head.appendChild(script);
        };

        loadGoogleMapsScript();

        return () => {
            if (window.initMap) {
                window.initMap = () => { };
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapRef.current || !window.google || mapObject) return;

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 39.92077, lng: 32.85411 },
                zoom: 6,
            });
            setMapObject(map);

            let marker: google.maps.Marker | null = null;

            map.addListener("click", (event: google.maps.MapMouseEvent) => {
                if (event.latLng) {
                    if (marker) marker.setMap(null);
                    marker = new window.google.maps.Marker({
                        position: event.latLng,
                        map: map,
                    });
                    setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                    setLocationError(false);
                    setLocationErrorMsg("");
                }
            });
        } catch (error) {
            console.error("Error initializing Google Maps:", error);
        }
    };

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    // Update location state
                    setLocation(currentLocation);

                    // Clear any location errors
                    setLocationError(false);
                    setLocationErrorMsg("");

                    // Update map and place marker
                    if (mapObject) {
                        mapObject.setCenter(currentLocation);
                        mapObject.setZoom(15); // Closer zoom for precision
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError(true);
                    setLocationErrorMsg(t('register.restaurant.locationServiceError'));
                }
            );
        } else {
            setLocationError(true);
            setLocationErrorMsg(t('register.restaurant.geolocationNotSupported'));
        }
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setProfileImage(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBase64Image(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateInputs = (): boolean => {
        const managerName =
            (document.getElementById("managerName") as HTMLInputElement)?.value || "";
        const managerLastName =
            (document.getElementById("managerLastName") as HTMLInputElement)?.value ||
            "";
        const managerPhone =
            (document.getElementById("managerPhone") as HTMLInputElement)?.value ||
            "";
        const restaurantName =
            (document.getElementById("restaurantName") as HTMLInputElement)?.value ||
            "";
        const restaurantAddress =
            (document.getElementById("restaurantAddress") as HTMLInputElement)
                ?.value || "";
        const taxId =
            (document.getElementById("taxId") as HTMLInputElement)?.value || "";
        const buildingNumber =
            (document.getElementById("buildingNumber") as HTMLInputElement)?.value ||
            "";
        const apartmentNumber =
            (document.getElementById("apartmentNumber") as HTMLInputElement)?.value ||
            "";
        const email =
            (document.getElementById("email") as HTMLInputElement)?.value || "";
        const password =
            (document.getElementById("password") as HTMLInputElement)?.value || "";
        const confirmPassword =
            (document.getElementById("confirmPassword") as HTMLInputElement)?.value ||
            "";

        let isValid = true;

        if (!managerName) {
            setManagerNameError(true);
            setManagerNameErrorMsg(t('register.validation.requiredFirstName'));
            isValid = false;
        } else {
            setManagerNameError(false);
            setManagerNameErrorMsg("");
        }

        if (!managerLastName) {
            setManagerLastNameError(true);
            setManagerLastNameErrorMsg(t('register.validation.requiredLastName'));
            isValid = false;
        } else {
            setManagerLastNameError(false);
            setManagerLastNameErrorMsg("");
        }

        if (!/^\d{10}$/.test(managerPhone)) {
            setManagerPhoneError(true);
            setManagerPhoneErrorMsg(t('register.validation.validPhone'));
            isValid = false;
        } else {
            setManagerPhoneError(false);
            setManagerPhoneErrorMsg("");
        }

        if (!restaurantName) {
            setRestaurantNameError(true);
            setRestaurantNameErrorMsg(t('register.validation.requiredFirstName'));
            isValid = false;
        } else {
            setRestaurantNameError(false);
            setRestaurantNameErrorMsg("");
        }

        if (!restaurantAddress) {
            setRestaurantAddressError(true);
            setRestaurantAddressErrorMsg(t('register.validation.requiredFirstName'));
            isValid = false;
        } else {
            setRestaurantAddressError(false);
            setRestaurantAddressErrorMsg("");
        }

        // Updated Tax ID validation to require exactly 10 characters
        if (!/^\d{10}$/.test(taxId)) {
            setTaxIdError(true);
            setTaxIdErrorMsg(t('register.restaurant.validTaxId'));
            isValid = false;
        } else {
            setTaxIdError(false);
            setTaxIdErrorMsg("");
        }

        if (!buildingNumber) {
            setBuildingNumberError(true);
            setBuildingNumberErrorMsg(t('register.validation.requiredFirstName'));
            isValid = false;
        } else {
            setBuildingNumberError(false);
            setBuildingNumberErrorMsg("");
        }

        if (!apartmentNumber) {
            setApartmentNumberError(true);
            setApartmentNumberErrorMsg(t('register.validation.requiredFirstName'));
            isValid = false;
        } else {
            setApartmentNumberError(false);
            setApartmentNumberErrorMsg("");
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            setEmailErrorMsg(t('register.validation.validEmail'));
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

        if (!location) {
            setLocationError(true);
            setLocationErrorMsg(t('register.restaurant.locationError'));
            isValid = false;
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
        setTaxIdError(false);
        setTaxIdErrorMsg("");

        if (validateInputs()) {
            const data = new FormData(e.currentTarget);

            const formDataObj = {
                name: data.get("restaurantName") as string,
                email: data.get("email") as string,
                password: data.get("password") as string,
                manager_Name: data.get("managerName") as string,
                manager_Last_Name: data.get("managerLastName") as string,
                phone_Number: data.get("managerPhone") as string,
                address: data.get("restaurantAddress") as string,
                tax_Id: data.get("taxId") as string,
                latitude: location?.lat ?? 0,
                longitude: location?.lng ?? 0,
                profile_image: base64Image,
                buildingNumber: data.get("buildingNumber") as string,
                apartmentNumber: data.get("apartmentNumber") as string,
            };

            try {
                setIsSendingCode(true);

                try {
                    const emailExists = await checkEmailExists(formDataObj.email);
                    if (emailExists) {
                        setEmailError(true);
                        setEmailErrorMsg(t('register.validation.emailExists'));
                        setIsSendingCode(false);
                        return;
                    }
                } catch (err) {
                    console.error("Email check failed:", err);
                    setGeneralError(t('register.validation.generalError'));
                    setIsSendingCode(false);
                    return;
                }

                try {
                    const taxIdExists = await checkTaxIdExists(formDataObj.tax_Id);
                    if (taxIdExists) {
                        setTaxIdError(true);
                        setTaxIdErrorMsg(t('register.restaurant.taxIdExists'));
                        setIsSendingCode(false);
                        return;
                    }
                } catch (err) {
                    console.error("Tax ID check failed:", err);
                    setGeneralError(t('register.validation.generalError'));
                    setIsSendingCode(false);
                    return;
                }

                await sendVerificationCode(formDataObj.email);
                setFormData(formDataObj);
                setShowVerificationDialog(true);
            } catch (err: any) {
                console.error("Code sending failed:", err);
                setGeneralError(t('register.validation.sendCodeError'));
            } finally {
                setIsSendingCode(false);
            }
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

            await registerRestaurant(formData);
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
                {t('register.restaurant.title')}
                {generalError && (
                    <Typography color="error" variant="body2" textAlign="center">
                        {generalError}
                    </Typography>
                )}
            </Typography>

            <FormControl>
                <FormLabel htmlFor="managerName">{t('register.restaurant.managerName')}</FormLabel>
                <TextField
                    id="managerName"
                    name="managerName"
                    variant="standard"
                    fullWidth
                    autoComplete="given-name"
                    error={managerNameError}
                    helperText={managerNameErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="managerLastName">{t('register.restaurant.managerLastName')}</FormLabel>
                <TextField
                    id="managerLastName"
                    name="managerLastName"
                    variant="standard"
                    fullWidth
                    autoComplete="family-name"
                    error={managerLastNameError}
                    helperText={managerLastNameErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="managerPhone">{t('register.restaurant.managerPhone')}</FormLabel>
                <TextField
                    id="managerPhone"
                    name="managerPhone"
                    variant="standard"
                    fullWidth
                    autoComplete="tel"
                    placeholder={t('register.common.phonePlaceholder')}
                    error={managerPhoneError}
                    helperText={managerPhoneErrorMsg}
                    inputProps={{ maxLength: 10 }}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="restaurantName">{t('register.restaurant.restaurantName')}</FormLabel>
                <TextField
                    id="restaurantName"
                    name="restaurantName"
                    variant="standard"
                    fullWidth
                    error={restaurantNameError}
                    helperText={restaurantNameErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="restaurantAddress">{t('register.restaurant.restaurantAddress')}</FormLabel>
                <TextField
                    id="restaurantAddress"
                    name="restaurantAddress"
                    variant="standard"
                    fullWidth
                    placeholder={t('register.restaurant.addressPlaceholder')}
                    error={restaurantAddressError}
                    helperText={restaurantAddressErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="taxId">{t('register.restaurant.taxId')}</FormLabel>
                <TextField
                    id="taxId"
                    name="taxId"
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    placeholder={t('register.restaurant.taxIdPlaceholder')}
                    error={taxIdError}
                    helperText={taxIdErrorMsg}
                    inputProps={{ maxLength: 10 }}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="buildingNumber">{t('register.restaurant.buildingNumber')}</FormLabel>
                <TextField
                    id="buildingNumber"
                    name="buildingNumber"
                    variant="standard"
                    fullWidth
                    error={buildingNumberError}
                    helperText={buildingNumberErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="apartmentNumber">{t('register.restaurant.apartmentNumber')}</FormLabel>
                <TextField
                    id="apartmentNumber"
                    name="apartmentNumber"
                    variant="standard"
                    fullWidth
                    error={apartmentNumberError}
                    helperText={apartmentNumberErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="email">{t('register.common.email')}</FormLabel>
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    variant="standard"
                    fullWidth
                    placeholder={t('register.common.emailPlaceholder')}
                    error={emailError}
                    helperText={emailErrorMsg}
                />
            </FormControl>

            <FormControl>
                <FormLabel htmlFor="password">{t('register.common.password')}</FormLabel>
                <TextField
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    variant="standard"
                    fullWidth
                    placeholder={t('register.common.passwordPlaceholder')}
                    autoComplete="new-password"
                    error={passwordError}
                    helperText={passwordErrorMsg}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={togglePasswordVisibility}
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
                    type={showPassword ? "text" : "password"}
                    variant="standard"
                    fullWidth
                    placeholder={t('register.common.passwordPlaceholder')}
                    autoComplete="new-password"
                    error={confirmPasswordError}
                    helperText={confirmPasswordErrorMsg}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={togglePasswordVisibility}
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
                <FormLabel htmlFor="profileImage">{t('register.restaurant.profileImage')}</FormLabel>
                <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </FormControl>

            {profileImage && (
                <Box>
                    <Typography variant="body2" mt={1}>
                        {t('register.restaurant.profilePreview')}
                    </Typography>
                    <img
                        src={URL.createObjectURL(profileImage)}
                        alt="Profile image preview"
                        style={{ maxWidth: 150, borderRadius: 8 }}
                    />
                </Box>
            )}

            <Typography fontWeight={500} mt={2}>
                {t('register.restaurant.locationTitle')}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Button above and aligned right */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        startIcon={<MyLocationIcon />}
                        onClick={getCurrentLocation}
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.primary.main,
                            boxShadow: 2,
                            "&:hover": {
                                backgroundColor: theme.palette.grey[100],
                            },
                        }}
                    >
                        {t('register.restaurant.myLocation')}
                    </Button>
                </Box>

                {/* Map */}
                <Box
                    ref={mapRef}
                    sx={{
                        height: 400,
                        width: "100%",
                        borderRadius: 2,
                        backgroundColor: theme.palette.grey[200],
                        overflow: "hidden",
                    }}
                />
            </Box>

            {location ? (
                <Typography fontSize={14} color="text.secondary">
                    {t('register.restaurant.selectedLocation')} {location.lat.toFixed(5)},{" "}
                    {location.lng.toFixed(5)}
                </Typography>
            ) : (
                locationError && (
                    <Typography fontSize={14} color="error">
                        {locationErrorMsg}
                    </Typography>
                )
            )}

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
                        <Typography variant="body2">
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

export default RegisterRestaurant;