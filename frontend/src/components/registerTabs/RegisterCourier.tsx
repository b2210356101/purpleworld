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
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  checkEmailExists,
  checkSsnExists,
  registerCourier,
  registerCustomer,
  sendVerificationCode,
  verifyEmailCode,
} from "../../utils/api";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const RegisterCourier = () => {
  const theme = useTheme();
  const navigate = useNavigate();

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
    setVerificationError("");

    if (validateInputs()) {
      const data = new FormData(event.currentTarget);

      const formDataObj = {
        first_Name: data.get("firstName") as string,
        last_Name: data.get("lastName") as string,
        ssn: data.get("ssn") as string,
        email: data.get("email") as string,
        phone_Number: data.get("phone") as string,
        password: data.get("password") as string,
      };

      try {
        setIsSendingCode(true);

        const emailExists = await checkEmailExists(formDataObj.email);
        if (emailExists) {
          setEmailError(true);
          setEmailErrorMsg("This email is already registered.");
          return;
        }

        const ssnExists = await checkSsnExists(formDataObj.ssn);
        if (ssnExists) {
          setSsnError(true);
          setSsnErrorMsg("This SSN is already registered.");
          return;
        }

        await sendVerificationCode(formDataObj.email);

        setFormData(formDataObj);
        setShowVerificationDialog(true);
      } catch (err: any) {
        console.error("Verification code send failed:", err);
        setGeneralError(
          "Something went wrong while sending the verification code."
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

      await registerCourier(formData);
      setShowVerificationDialog(false);
      navigate("/login");
    } catch (err) {
      console.error("Final registration error:", err);
      setVerificationError("Something went wrong during registration.");
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

export default RegisterCourier;
