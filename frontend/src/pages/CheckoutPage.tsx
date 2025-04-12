import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  InputAdornment,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useState, useEffect } from "react";

// Define types for our data structures
interface CardInfo {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  restaurant: string;
}

interface Address {
  id?: string;
  text: string;
  isDefault?: boolean;
}

interface CheckoutData {
  paymentType: "credit" | "cash";
  cardInfo: CardInfo;
  address: Address;
  cartItems: CartItem[];
  discount: number;
  total: number;
}

const CheckoutPage = () => {
  const theme = useTheme();

  // Main checkout state object that will be sent to backend
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    paymentType: "credit",
    cardInfo: {
      name: "",
      number: "",
      expiry: "",
      cvv: "",
    },
    address: {
      text: "Hacettepe Beytepe Kampüsü, Asistan Evleri, Çankaya / Ankara",
      isDefault: true
    },
    cartItems: [
      {
        id: "item1",
        name: "McChicken Burger",
        price: 480,
        restaurant: "McBurgers"
      },
      {
        id: "item2",
        name: "Extra Extra Double Mix Pizza",
        price: 320,
        restaurant: "Domitoz Pizza"
      }
    ],
    discount: 80,
    total: 720
  });

  // UI states
  const [flipCard, setFlipCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning"
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Derived values for the UI
  const totalItems = checkoutData.cartItems.length;
  const itemTotal = checkoutData.cartItems.reduce((sum, item) => sum + item.price, 0);

  // Update payment type in the main state
  const handlePaymentTypeChange = (type: "credit" | "cash") => {
    setCheckoutData(prev => ({
      ...prev,
      paymentType: type
    }));
  };

  // Update card info in the main state
  const handleCardInput = (field: keyof CardInfo, value: string) => {
    setCheckoutData(prev => ({
      ...prev,
      cardInfo: {
        ...prev.cardInfo,
        [field]: value
      }
    }));
    
    // For card flip animation
    setFlipCard(field === "cvv");

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (checkoutData.paymentType === "credit") {
      if (!checkoutData.cardInfo.name) {
        newErrors.name = "Name on card is required";
      }
      
      if (!checkoutData.cardInfo.number) {
        newErrors.number = "Card number is required";
      } else if (!/^\d{16}$/.test(checkoutData.cardInfo.number.replace(/\s/g, ''))) {
        newErrors.number = "Please enter a valid 16-digit card number";
      }
      
      if (!checkoutData.cardInfo.expiry) {
        newErrors.expiry = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(checkoutData.cardInfo.expiry)) {
        newErrors.expiry = "Please enter a valid expiry date (MM/YY)";
      }
      
      if (!checkoutData.cardInfo.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(checkoutData.cardInfo.cvv)) {
        newErrors.cvv = "Please enter a valid CVV";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mock function that would be replaced with actual API call
  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // This is where you would make the real API call
     
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success notification
      setNotification({
        open: true,
        message: "Payment successful! Your order is being processed.",
        severity: "success"
      });
      
      // Reset form or redirect
      console.log("Payment data that would be sent to the backend:", checkoutData);
      
    } catch (error) {
      // Handle errors
      setNotification({
        open: true,
        message: "Payment failed. Please try again.",
        severity: "error"
      });
      console.error("Error processing payment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  // Format card number with spaces for display
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date for display
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={4}>
        Secure Checkout
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        gap={6}
        flexDirection={{ xs: "column", md: "row" }}
      >
        {/* LEFT SECTION */}
        <Box flex={1}>
          {/* Delivery Address */}
          <Box mb={4}>
            <Typography fontWeight={600} fontSize={16} mb={1}>
              <LocationOnIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
              Delivery address
            </Typography>

            <Box width="90%">
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                  color: "white",
                  minHeight: 80,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <LocationOnIcon sx={{ fontSize: 20, color: "white" }} />
                <Typography fontWeight={500} fontSize={14}>
                  {checkoutData.address.text}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Payment Type */}
          <Box mb={4}>
            <Typography fontWeight={600} mb={1}>
              Type of Payment
            </Typography>
            <Box display="flex" gap={2}>
              {[
                {
                  type: "credit",
                  icon: <CreditCardIcon sx={{ mr: 1, fontSize: 18 }} />,
                  label: "Credit Card",
                },
                {
                  type: "cash",
                  icon: <LocalAtmIcon sx={{ mr: 1, fontSize: 18 }} />,
                  label: "Cash on Delivery",
                },
              ].map(({ type, icon, label }) => (
                <Box
                  key={type}
                  onClick={() => handlePaymentTypeChange(type as "credit" | "cash")}
                  sx={{
                    border: `2px dashed ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    width: 180,
                    height: 50,
                    p: 1.5,
                    cursor: "pointer",
                    backgroundColor:
                      checkoutData.paymentType === type
                        ? theme.palette.primary.main
                        : "white",
                    color:
                      checkoutData.paymentType === type
                        ? "white"
                        : theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    transition: "all 0.3s ease",
                  }}
                >
                  {icon}
                  {label}
                </Box>
              ))}
            </Box>

            {/* Credit Card UI */}
            {checkoutData.paymentType === "credit" && (
              <Paper
                sx={{
                  p: 4,
                  backgroundColor: theme.palette.primary.light,
                  borderRadius: 6,
                  mt: 3,
                }}
              >
                <Box mb={4} display="flex" justifyContent="center">
                  <Cards
                    number={checkoutData.cardInfo.number}
                    name={checkoutData.cardInfo.name}
                    expiry={checkoutData.cardInfo.expiry.replace("/", "")}
                    cvc={checkoutData.cardInfo.cvv}
                    focused={
                      flipCard
                        ? "cvc"
                        : checkoutData.cardInfo.expiry
                        ? "expiry"
                        : checkoutData.cardInfo.number
                        ? "number"
                        : "name"
                    }
                  />
                </Box>

                <Typography fontSize={14} fontWeight={500} color="text.secondary" mb={0.5}>
                  Name on card:
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Name Surname"
                  value={checkoutData.cardInfo.name}
                  onChange={(e) => handleCardInput("name", e.target.value)}
                  onFocus={() => setFlipCard(false)}
                  sx={{ mb: 3, backgroundColor: "white", borderRadius: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <PersonIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.name}
                  helperText={errors.name}
                />

                <Typography fontSize={14} fontWeight={500} color="text.secondary" mb={0.5}>
                  Card number:
                </Typography>
                <TextField
                  fullWidth
                  placeholder="5124 4000 0000 0000"
                  value={checkoutData.cardInfo.number}
                  onChange={(e) => handleCardInput("number", formatCardNumber(e.target.value))}
                  onFocus={() => setFlipCard(false)}
                  sx={{ mb: 3, backgroundColor: "white", borderRadius: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CreditCardIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.number}
                  helperText={errors.number}
                />

                <Box display="flex" gap={2}>
                  <Box flex={1}>
                    <Typography fontSize={14} fontWeight={500} color="text.secondary" mb={0.5}>
                      Expiry date:
                    </Typography>
                    <TextField
                      placeholder="MM / YY"
                      value={checkoutData.cardInfo.expiry}
                      onChange={(e) => handleCardInput("expiry", formatExpiryDate(e.target.value))}
                      onFocus={() => setFlipCard(false)}
                      fullWidth
                      sx={{ backgroundColor: "white", borderRadius: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.expiry}
                      helperText={errors.expiry}
                    />
                  </Box>

                  <Box flex={1}>
                    <Typography fontSize={14} fontWeight={500} color="text.secondary" mb={0.5}>
                      CCV
                    </Typography>
                    <TextField
                      placeholder="***"
                      value={checkoutData.cardInfo.cvv}
                      onChange={(e) => handleCardInput("cvv", e.target.value.slice(0, 4))}
                      onFocus={() => setFlipCard(true)}
                      fullWidth
                      sx={{ backgroundColor: "white", borderRadius: 2 }}
                      error={!!errors.cvv}
                      helperText={errors.cvv}
                    />
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </Box>

        {/* RIGHT SECTION: Cart Summary */}
        <Box flex={1}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: theme.palette.primary.light,
              minWidth: 300,
              maxWidth: 360,
              mx: "auto",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography fontWeight={700} fontSize={20}>
                Cart
              </Typography>
              <Typography fontWeight={500} fontSize={14} color="text.secondary">
                {totalItems} Items
              </Typography>
            </Box>
            
            {checkoutData.cartItems.map((item, index) => (
              <Box key={item.id} mb={index === checkoutData.cartItems.length - 1 ? 2 : 1}>
                <Typography variant="body2" fontWeight={600} color="primary">
                  from {item.restaurant}
                </Typography>
                <Typography fontSize={14}>{item.name}</Typography>
                <Typography fontSize={14} mb={1}>
                  {item.price}₺
                </Typography>
              </Box>
            ))}

            <Box mb={1.5}>
              <Typography fontWeight={500} fontSize={13} color="text.secondary" mb={1}>
                Bill details
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={500} fontSize={14} color="text.secondary">
                  Item Total
                </Typography>
                <Typography fontWeight={600} fontSize={14}>
                  {itemTotal}₺
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={500} fontSize={14} color="text.secondary">
                  Discount
                </Typography>
                <Typography fontWeight={600} fontSize={14}>
                  -{checkoutData.discount}₺
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>Total</span>
              <span>{checkoutData.total}₺</span>
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 999,
                py: 1,
                fontSize: 16,
              }}
              onClick={processPayment}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Proceed To Payment"
              )}
            </Button>
          </Paper>
        </Box>
      </Box>
      
      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckoutPage;