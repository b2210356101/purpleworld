import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCourier } from "../../utils/api";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/hooks";
import { registerSuccess } from "../../store/slices/authSlice";

const RegisterCourier = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [generalError, setGeneralError] = useState(""); 

  // Individual error states for each field
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [ssnError, setSsnError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [acceptTermsError, setAcceptTermsError] = useState(false);

  // Individual error message states
  const [firstNameErrorMsg, setFirstNameErrorMsg] = useState("");
  const [lastNameErrorMsg, setLastNameErrorMsg] = useState("");
  const [phoneErrorMsg, setPhoneErrorMsg] = useState("");
  const [ssnErrorMsg, setSsnErrorMsg] = useState("");
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState("");

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const validateInputs = (): boolean => {
    const firstName =
      (document.getElementById("firstName") as HTMLInputElement)?.value || "";
    const lastName =
      (document.getElementById("lastName") as HTMLInputElement)?.value || "";
    const phone =
      (document.getElementById("phone") as HTMLInputElement)?.value || "";
    const ssn =
      (document.getElementById("ssn") as HTMLInputElement)?.value || "";
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
      setFirstNameErrorMsg("Please enter your first name.");
      isValid = false;
    } else {
      setFirstNameError(false);
      setFirstNameErrorMsg("");
    }

    if (!lastName) {
      setLastNameError(true);
      setLastNameErrorMsg("Please enter your last name.");
      isValid = false;
    } else {
      setLastNameError(false);
      setLastNameErrorMsg("");
    }

    if (!/^\d{10}$/.test(phone)) {
      setPhoneError(true);
      setPhoneErrorMsg("Please enter a valid phone number.");
      isValid = false;
    } else {
      setPhoneError(false);
      setPhoneErrorMsg("");
    }

    if (!/^\d{11}$/.test(ssn)) {
      setSsnError(true);
      setSsnErrorMsg("Please enter a valid 11-digit SSN number.");
      isValid = false;
    } else {
      setSsnError(false);
      setSsnErrorMsg("");
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
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*_)."
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

    if (!acceptTerms) {
      setAcceptTermsError(true);
      isValid = false;
    } else {
      setAcceptTermsError(false);
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError(""); 

    if (validateInputs()) {
      const data = new FormData(event.currentTarget);

      const formData = {
        first_Name: data.get("firstName") as string,
        last_Name: data.get("lastName") as string,
        ssn: data.get("ssn") as string,
        email: data.get("email") as string,
        phone_Number: data.get("phone") as string,
        password: data.get("password") as string,
      };

      try {
        const response = await registerCourier(formData);
        console.log("Courier registered:", response);
        dispatch(
          registerSuccess({
            token: response.token,
            roleType: "COURIER",
            userInfo: {
              email: formData.email,
              name: `${formData.first_Name} ${formData.last_Name}`,
            },
          })
        );
        navigate("/");
      } catch (err: any) {
        console.error("Registration failed:", err);
        if (err.response && err.response.data && err.response.data.message) {
          const errorMessage = err.response.data.message;
          if (errorMessage === "A courier with this email already exists") {
            setEmailError(true);
            setEmailErrorMsg("This email is already registered.");
          } else {
            setGeneralError(errorMessage);
          }
        } else {
          setGeneralError(
            "An error occurred during registration. Please try again."
          );
        }
      }
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 4,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={600}
        textAlign="center"
        color="primary"
      >
        Register as a Courier
      </Typography>

      {generalError && (
        <Typography color="error" variant="body2" textAlign="center">
          {generalError}
        </Typography>
      )}

      <FormControl>
        <FormLabel htmlFor="firstName">First Name</FormLabel>
        <TextField
          id="firstName"
          name="firstName"
          variant="standard"
          fullWidth
          autoComplete="given-name"
          error={firstNameError}
          helperText={firstNameErrorMsg}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="lastName">Last Name</FormLabel>
        <TextField
          id="lastName"
          name="lastName"
          variant="standard"
          fullWidth
          autoComplete="family-name"
          error={lastNameError}
          helperText={lastNameErrorMsg}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="phone">Phone Number</FormLabel>
        <TextField
          id="phone"
          name="phone"
          variant="standard"
          fullWidth
          autoComplete="tel"
          placeholder="e.g. 5551234567"
          error={phoneError}
          helperText={phoneErrorMsg}
          inputProps={{ maxLength: 10 }}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="ssn">SSN Number</FormLabel>
        <TextField
          id="ssn"
          name="ssn"
          variant="standard"
          fullWidth
          autoComplete="off"
          placeholder="12345678901"
          error={ssnError}
          helperText={ssnErrorMsg}
          inputProps={{ maxLength: 11 }}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="email">Email</FormLabel>
        <TextField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. mail@example.com"
          variant="standard"
          fullWidth
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
              I accept the terms & conditions
            </Typography>
          }
        />
      </FormControl>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
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
        Register
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
    </Box>
  );
};

export default RegisterCourier;
