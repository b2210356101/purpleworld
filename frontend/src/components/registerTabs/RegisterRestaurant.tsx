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
  // ai-gen
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
        window.initMap = () => {};
      }
    };
  }, []);
  // ai-gen end

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
  // Inside your RegisterRestaurant component, add this new function
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
          setLocationErrorMsg(
            "Unable to get your current location. Please enable location services."
          );
        }
      );
    } else {
      setLocationError(true);
      setLocationErrorMsg("Geolocation is not supported by this browser.");
    }
  };

  // ai-gen
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
  // ai-gen end

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
      setManagerNameErrorMsg("Please enter manager's first name.");
      isValid = false;
    } else {
      setManagerNameError(false);
      setManagerNameErrorMsg("");
    }

    if (!managerLastName) {
      setManagerLastNameError(true);
      setManagerLastNameErrorMsg("Please enter manager's last name.");
      isValid = false;
    } else {
      setManagerLastNameError(false);
      setManagerLastNameErrorMsg("");
    }

    if (!/^\d{10}$/.test(managerPhone)) {
      setManagerPhoneError(true);
      setManagerPhoneErrorMsg("Please enter a valid phone number.");
      isValid = false;
    } else {
      setManagerPhoneError(false);
      setManagerPhoneErrorMsg("");
    }

    if (!restaurantName) {
      setRestaurantNameError(true);
      setRestaurantNameErrorMsg("Please enter restaurant name.");
      isValid = false;
    } else {
      setRestaurantNameError(false);
      setRestaurantNameErrorMsg("");
    }

    if (!restaurantAddress) {
      setRestaurantAddressError(true);
      setRestaurantAddressErrorMsg("Please enter restaurant address.");
      isValid = false;
    } else {
      setRestaurantAddressError(false);
      setRestaurantAddressErrorMsg("");
    }

    // Updated Tax ID validation to require exactly 10 characters
    if (!/^\d{10}$/.test(taxId)) {
      setTaxIdError(true);
      setTaxIdErrorMsg("Please enter a valid 10-digit Tax ID.");
      isValid = false;
    } else {
      setTaxIdError(false);
      setTaxIdErrorMsg("");
    }

    if (!buildingNumber) {
      setBuildingNumberError(true);
      setBuildingNumberErrorMsg("Please enter building number.");
      isValid = false;
    } else {
      setBuildingNumberError(false);
      setBuildingNumberErrorMsg("");
    }

    if (!apartmentNumber) {
      setApartmentNumberError(true);
      setApartmentNumberErrorMsg("Please enter apartment number.");
      isValid = false;
    } else {
      setApartmentNumberError(false);
      setApartmentNumberErrorMsg("");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMsg("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMsg("");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_])[A-Za-z\d!@#$%^&*_]{8,}$/;

    if (!password || !passwordRegex.test(password)) {
      setPasswordError(true);
      setPasswordErrorMsg(
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*+-=)."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMsg("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMsg("Passwords do not match.");
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMsg("");
    }

    if (!location) {
      setLocationError(true);
      setLocationErrorMsg("Please select a location on the map.");
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
            setEmailErrorMsg("This email is already registered.");
            setIsSendingCode(false);
            return;
          }
        } catch (err) {
          console.error("Email check failed:", err);
          setGeneralError("Error while checking email.");
          setIsSendingCode(false);
          return;
        }

        try {
          const taxIdExists = await checkTaxIdExists(formDataObj.tax_Id);
          if (taxIdExists) {
            setTaxIdError(true);
            setTaxIdErrorMsg("This Tax ID is already registered.");
            setIsSendingCode(false);
            return;
          }
        } catch (err) {
          console.error("Tax ID check failed:", err);
          setGeneralError("Error while checking Tax ID.");
          setIsSendingCode(false);
          return;
        }

        await sendVerificationCode(formDataObj.email);
        setFormData(formDataObj);
        setShowVerificationDialog(true);
      } catch (err: any) {
        console.error("Code sending failed:", err);
        setGeneralError(
          "An error occurred while sending the verification code."
        );
      } finally {
        setIsSendingCode(false);
      }
    }
  };

  const handleVerifyAndRegister = async () => {
    setVerificationError("");

    if (!formData) {
      setVerificationError("Missing form data.");
      return;
    }

    try {
      const isValid = await verifyEmailCode(formData.email, verificationCode);
      if (!isValid) {
        setVerificationError("Invalid or expired verification code.");
        return;
      }

      await registerRestaurant(formData);
      setShowVerificationDialog(false);
      navigate("/login");
    } catch (err: any) {
      console.error("Final registration error:", err);
      setVerificationError(
        "Something went wrong during verification or registration."
      );
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
    // ai-gen
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
      {/* ai-gen end */}
      <Typography
        variant="h4"
        fontWeight={600}
        textAlign="center"
        color="primary"
      >
        Register Your Restaurant
        {generalError && (
          <Typography color="error" variant="body2" textAlign="center">
            {generalError}
          </Typography>
        )}
      </Typography>

      <FormControl>
        <FormLabel htmlFor="managerName">Manager Name</FormLabel>
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
        <FormLabel htmlFor="managerLastName">Manager Last Name</FormLabel>
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
        <FormLabel htmlFor="managerPhone">Manager Phone</FormLabel>
        <TextField
          id="managerPhone"
          name="managerPhone"
          variant="standard"
          fullWidth
          autoComplete="tel"
          placeholder="e.g. 5551234567"
          error={managerPhoneError}
          helperText={managerPhoneErrorMsg}
          inputProps={{ maxLength: 10 }}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="restaurantName">Restaurant Name</FormLabel>
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
        <FormLabel htmlFor="restaurantAddress">Restaurant Address</FormLabel>
        <TextField
          id="restaurantAddress"
          name="restaurantAddress"
          variant="standard"
          fullWidth
          placeholder="e.g. 123 Main St"
          error={restaurantAddressError}
          helperText={restaurantAddressErrorMsg}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="taxId">Tax ID</FormLabel>
        <TextField
          id="taxId"
          name="taxId"
          variant="standard"
          fullWidth
          autoComplete="off"
          placeholder="e.g. 1234567890"
          error={taxIdError}
          helperText={taxIdErrorMsg}
          inputProps={{ maxLength: 10 }}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="buildingNumber">Building Number</FormLabel>
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
        <FormLabel htmlFor="apartmentNumber">Apartment Number</FormLabel>
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
        <FormLabel htmlFor="email">Email</FormLabel>
        <TextField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          variant="standard"
          fullWidth
          placeholder="e.g. mail@example.com"
          error={emailError}
          helperText={emailErrorMsg}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="password">Password</FormLabel>
        <TextField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          variant="standard"
          fullWidth
          placeholder="••••••"
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
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <TextField
          id="confirmPassword"
          name="passwordConfirmation"
          type={showPassword ? "text" : "password"}
          variant="standard"
          fullWidth
          placeholder="••••••"
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
        <FormLabel htmlFor="profileImage">Upload Profile Image</FormLabel>
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
            Preview:
          </Typography>
          <img
            src={URL.createObjectURL(profileImage)}
            alt="Profile image preview"
            style={{ maxWidth: 150, borderRadius: 8 }}
          />
        </Box>
      )}

      <Typography fontWeight={500} mt={2}>
        Select Restaurant Location
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
            My Location
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
          Selected Location: {location.lat.toFixed(5)},{" "}
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
              I accept the terms & conditions
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
            Sending code...
          </Box>
        ) : (
          "Register"
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
        Already have an account? Login now.
      </Typography>
      {/* Dialog: Verification Code Popup */}
      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Verification Code</DialogTitle>
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
            Cancel
          </Button>
          <Button variant="contained" onClick={handleVerifyAndRegister}>
            Verify & Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterRestaurant;
