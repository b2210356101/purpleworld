import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import Cards from "react-credit-cards-2";
import { useNavigate } from "react-router-dom";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  getCurrentAddress,
  getCustomerAddresses,
  placeOrder,
  viewCart,
} from "../utils/api";
import {
  ViewCartResponse,
  CartGroupResponse,
  CartItemResponse,
} from "../types";
import CheckoutSummary from "../components/CheckoutSummary";

// types
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
  img: string;
  quantity: number;
}
interface CartGroup {
  groupId: string;
  restaurantId: string;
  restaurantName: string;
  note: string;
  items: CartItem[];
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
  cartGroups: CartGroup[];
  discount: number;
  total: number;
  itemTotal: number;
}

const CheckoutPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    paymentType: "credit",
    cardInfo: { name: "", number: "", expiry: "", cvv: "" },
    address: { text: "", isDefault: true },
    cartGroups: [],
    discount: 0,
    total: 0,
    itemTotal: 0,
  });

  // UI states
  const [flipCard, setFlipCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // fetch address + cart once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const current = await getCurrentAddress(); // { addressId } or null
        if (current) {
          const { addressId } = current;
          const { addresses } = await getCustomerAddresses();
          const found = addresses.find((a:any) => a.addressId === addressId);
          if (found) {
            setCheckoutData((prev) => ({
              ...prev,
              address: { text: found.fullAddress, isDefault: true },
            }));
          }
        }

        const cart: ViewCartResponse = await viewCart();

        // Convert API response to our grouped cart structure
        const groups: CartGroup[] = cart.groups.map((g: CartGroupResponse) => ({
          groupId: String(g.groupId),
          restaurantId: String(g.restaurantId),
          restaurantName: g.restaurantName,
          note: g.note || "",
          items: g.items.map((i: CartItemResponse) => ({
            id: String(i.itemId),
            name: i.itemName,
            img: i.itemImg,
            price: i.itemPrice,
            quantity: i.quantity,
          })),
        }));

        // Calculate item total
        const itemTotal = groups.reduce(
          (total, group) =>
            total +
            group.items.reduce(
              (groupTotal, item) => groupTotal + item.price * item.quantity,
              0
            ),
          0
        );

        setCheckoutData((prev) => ({
          ...prev,
          cartGroups: groups,
          itemTotal: itemTotal,
          total: cart.cartTotal,
        }));
      } catch (e) {
        console.error("Fetch error:", e);
      }
    };
    fetchData();
  }, []);

  // handlers
  const handlePaymentTypeChange = (type: "credit" | "cash") => {
    setCheckoutData((prev) => ({ ...prev, paymentType: type }));
  };

  const handleCardInput = (field: keyof CardInfo, value: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      cardInfo: { ...prev.cardInfo, [field]: value },
    }));
    setFlipCard(field === "cvv");
    setErrors((prev) => {
      const p = { ...prev };
      delete p[field];
      return p;
    });
  };

  const validateForm = () => {
    const newErr: Record<string, string> = {};
    if (checkoutData.paymentType === "credit") {
      // Name validation - Allow letters, spaces, hyphens, apostrophes
      if (!checkoutData.cardInfo.name) {
        newErr.name = "Name on card is required";
      } else if (!/^[a-zA-Z\s\-'\.]+$/.test(checkoutData.cardInfo.name)) {
        newErr.name = "Please enter a valid cardholder name";
      }
      
      // Card number validation - strictly require 16 digits
      const cardNumber = checkoutData.cardInfo.number.replace(/\s/g, "");
      if (!/^\d{16}$/.test(cardNumber)) {
        newErr.number = "Please enter a valid 16-digit card number";
      }
      
      // Expiry date validation - MM/YY format
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(checkoutData.cardInfo.expiry)) {
        newErr.expiry = "Please enter a valid expiry date (MM/YY)";
      } else {
        // Check if card is expired
        const [month, year] = checkoutData.cardInfo.expiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const today = new Date();
        
        // Set expiry to last day of month
        expiryDate.setDate(new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 0).getDate());
        
        if (expiryDate < today) {
          newErr.expiry = "Card has expired";
        }
      }
      
      // CVV validation - strictly 3 digits
      if (!/^[0-9]{3}$/.test(checkoutData.cardInfo.cvv)) {
        newErr.cvv = "Please enter a valid 3-digit security code";
      }
    }
    
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const processPayment = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Limit note length to 200 characters to prevent excessive data
      const MAX_NOTE_LENGTH = 200;
      
      const combinedNote = checkoutData.cartGroups
        .map((g) => g.note)
        .filter((n) => !!n)
        .join("; ");
      
      const orderReq = {
        paymentType: checkoutData.paymentType,
        note: combinedNote.substring(0, MAX_NOTE_LENGTH),
      };
      
      const orderResp = await placeOrder(orderReq);

      // Navigate to home page with order data
      navigate("/", {
        state: {
          orderData: {
            orderId: orderResp.orderId,
            status: orderResp.status, // Fallback if status is missing
            totalPrice: orderResp.totalPrice, 
            estimatedDuration: orderResp.estimatedDuration,  // Fallback
            paymentType: checkoutData.paymentType,
            note: orderReq.note
          },
        },
      });
      console.log("Order response:", orderResp);

      window.dispatchEvent(new CustomEvent("order-placed"));

      setNotification({
        open: true,
        message: `Order #${orderResp.orderId} placed!`,
        severity: "success",
      });
    } catch (error: any) {
      setNotification({
        open: true,
        message: error?.message || "Failed to place order.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Format card number with spaces after every 4 digits
  const formatCardNumber = (v: string) => {
    const digitsOnly = v.replace(/\D/g, "");
    // Limit to 16 digits
    const truncated = digitsOnly.slice(0, 16);
    return truncated
      .match(/.{1,4}/g)
      ?.join(" ") || truncated;
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (v: string) => {
    const digitsOnly = v.replace(/\D/g, "");
    // Format as MM/YY and limit length
    return digitsOnly.replace(/^(\d{0,2})(\d{0,2}).*/, (_, month, year) => {
      if (month) {
        // Prevent month > 12
        if (parseInt(month) > 12) month = "12";
        
        if (year) return `${month}/${year}`;
        return month;
      }
      return digitsOnly;
    }).substring(0, 5);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={4}>
        Secure Checkout
      </Typography>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={6}>
        {/* LEFT */}
        <Box flex={1}>
          {/* address */}
          <Typography fontWeight={600} fontSize={16} mb={1} component="div">
            <LocationOnIcon
              sx={{
                mr: 1,
                verticalAlign: "middle",
                color: theme.palette.primary.main,
              }}
            />
            Delivery address
          </Typography>
          {!checkoutData.address.text ? (
            <CircularProgress size={24} />
          ) : (
            <Paper
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LocationOnIcon />{" "}
              <Typography>{checkoutData.address.text}</Typography>
            </Paper>
          )}

          {/* payment type */}
          <Box mt={4} mb={2}>
            <Typography fontWeight={600} mb={1}>
              Type of Payment
            </Typography>
            <Box display="flex" gap={2}>
              {[
                {
                  type: "credit",
                  icon: <CreditCardIcon />,
                  label: "Credit Card",
                },
                {
                  type: "cash",
                  icon: <LocalAtmIcon />,
                  label: "Cash on Delivery",
                },
              ].map(({ type, icon, label }) => (
                <Box
                  key={type}
                  onClick={() => handlePaymentTypeChange(type as any)}
                  sx={{
                    border: `2px dashed ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    height: 50,
                    p: 1.5,
                    cursor: "pointer",
                    bgcolor:
                      checkoutData.paymentType === type
                        ? theme.palette.primary.main
                        : "background.default",
                    color:
                      checkoutData.paymentType === type
                        ? "white"
                        : theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                  }}
                >
                  {icon}
                  {label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* card UI */}
          {checkoutData.paymentType === "credit" && (
            <Paper
              sx={{
                p: 4,
                bgcolor: theme.palette.primary.light,
                borderRadius: 6,
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
                      : checkoutData.cardInfo.number
                      ? "number"
                      : checkoutData.cardInfo.expiry
                      ? "expiry"
                      : "name"
                  }
                />
              </Box>

              <Typography fontSize={14} fontWeight={500} mb={0.5}>
                Name on card:
              </Typography>
              <TextField
                fullWidth
                placeholder="Name Surname"
                value={checkoutData.cardInfo.name}
                onChange={(e) => handleCardInput("name", e.target.value)}
                onFocus={() => setFlipCard(false)}
                sx={{ mb: 3, borderRadius: 2 }}
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

              <Typography fontSize={14} fontWeight={500} mb={0.5}>
                Card number:
              </Typography>
              <TextField
                fullWidth
                placeholder="1234 5678 9012 3456"
                value={checkoutData.cardInfo.number}
                onChange={(e) =>
                  handleCardInput("number", formatCardNumber(e.target.value))
                }
                onFocus={() => setFlipCard(false)}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CreditCardIcon
                        sx={{ color: theme.palette.primary.main }}
                      />
                    </InputAdornment>
                  ),
                }}
                error={!!errors.number}
                helperText={errors.number}
              />

              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography fontSize={14} fontWeight={500} mb={0.5}>
                    Expiry date:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="MM/YY"
                    value={checkoutData.cardInfo.expiry}
                    onChange={(e) =>
                      handleCardInput(
                        "expiry",
                        formatExpiryDate(e.target.value)
                      )
                    }
                    onFocus={() => setFlipCard(false)}
                    sx={{ borderRadius: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarMonthIcon
                            sx={{ color: theme.palette.primary.main }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.expiry}
                    helperText={errors.expiry}
                  />
                </Box>
                <Box flex={1}>
                  <Typography fontSize={14} fontWeight={500} mb={0.5}>
                    CVV
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="***"
                    value={checkoutData.cardInfo.cvv}
                    onChange={(e) =>
                      handleCardInput("cvv", e.target.value.slice(0, 3))
                    }
                    onFocus={() => setFlipCard(true)}
                    sx={{ borderRadius: 2 }}
                    error={!!errors.cvv}
                    helperText={errors.cvv}
                  />
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        {/* RIGHT: summary */}
        <Box flex={1}>
          <CheckoutSummary
            cartGroups={checkoutData.cartGroups}
            totalAmount={checkoutData.total}
            discount={checkoutData.discount}
            itemTotal={checkoutData.itemTotal}
            loading={loading}
            processPayment={processPayment}
          />
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckoutPage;