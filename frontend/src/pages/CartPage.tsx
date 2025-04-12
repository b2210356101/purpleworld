import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
  TextField,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useNavigate } from "react-router-dom";
import { viewCart, updateItemQuantity, removeItemFromCart } from "../utils/api";
import {
  ViewCartResponse,
  CartGroupResponse,
  CartItemResponse,
} from "../types";

const ShoppingCartPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartGroupResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoCodeMessage, setPromoCodeMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [promoCodeLoading, setPromoCodeLoading] = useState<boolean>(false);
  const [discount, setDiscount] = useState<string>("0₺");
  const [totalAmount, setTotalAmount] = useState<string>("0₺");
  const [itemTotal, setItemTotal] = useState<string>("0₺");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data: ViewCartResponse = await viewCart();

      // Filter out any restaurant groups that have no items
      const nonEmptyGroups = data.groups.filter(
        (group) => group.items.length > 0
      );

      setCartItems(nonEmptyGroups);
      setItemTotal(`${data.cartTotal}₺`);
      setTotalAmount(`${data.cartTotal}₺`);
    } catch (err) {
      setError("Failed to load cart items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (
    cartItemId: number, // this is CartItem.id from backend
    operation: "+" | "-",
    quantity: number
  ) => {
    try {
      if (operation === "-" && quantity === 1) {
        await removeItemFromCart(cartItemId);
      } else {
        await updateItemQuantity(cartItemId, operation);
      }
      await fetchCart();
    } catch (err: any) {
      console.error("Cart update error:", err);
      setError("Failed to update cart item.");
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading your cart...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Shopping Cart
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h6" mb={2}>
            Your cart is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={4}
          alignItems="stretch"
        >
          <Box
            flex={3}
            width={{ xs: "100%", md: "auto" }}
            display="flex"
            flexDirection="column"
            gap={4}
          >
            {cartItems.map((group) => (
              <Paper
                key={group.restaurantId}
                sx={{
                  borderRadius: 4,
                  backgroundColor: theme.palette.primary.light,
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: 650,
                  mx: "-8",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    px: 3,
                    py: 1.5,
                  }}
                >
                  <Typography fontWeight={600}>
                    {group.restaurantName}
                  </Typography>
                </Box>

                <Box px={3} pt={2}>
                  {group.items.map((item: CartItemResponse) => (
                    <Box
                      key={item.itemId}
                      display="flex"
                      justifyContent="space-between"
                      gap={2}
                      sx={{
                        backgroundColor: "white",
                        p: 2,
                        borderRadius: 3,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={item.itemImg}
                          alt={item.itemName}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Box>

                      <Box flex="1 1 200px">
                        <Typography fontWeight={600}>
                          {item.itemName}
                        </Typography>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-end"
                        justifyContent="space-between"
                      >
                        <Typography fontWeight={700} color="primary">
                          {item.itemPrice}₺
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          mt={1}
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: "20px",
                            px: 1,
                            py: 0.5,
                            color: "white",
                            minWidth: 100, // ensures static size
                            justifyContent: "space-between",
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{ color: "white", width: 32, height: 32 }}
                            onClick={() =>
                              handleQuantityChange(
                                item.itemId,
                                "-",
                                item.quantity
                              )
                            }
                          >
                            {item.quantity === 1 ? (
                              <DeleteIcon fontSize="small" />
                            ) : (
                              <RemoveIcon fontSize="small" />
                            )}
                          </IconButton>

                          <Box
                            sx={{
                              width: 24,
                              textAlign: "center",
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {item.quantity}
                          </Box>

                          <IconButton
                            size="small"
                            sx={{ color: "white", width: 32, height: 32 }}
                            onClick={() =>
                              handleQuantityChange(
                                item.itemId,
                                "+",
                                item.quantity
                              )
                            }
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>

          <Box flex={1} display="flex" flexDirection="column" gap={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: theme.palette.primary.light,
              }}
            >
              <Typography fontWeight={600} mb={1}>
                🏡 Promo Code
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="SEPETTE80"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={promoCodeLoading}
                  onClick={() => {
                    if (promoCode === "SEPETTE80") {
                      setPromoCodeMessage({
                        text: "Promo code applied successfully!",
                        isError: false,
                      });
                      setDiscount("80₺");
                      setTotalAmount(`${parseFloat(itemTotal) - 80}₺`);
                    } else {
                      setPromoCodeMessage({
                        text: "Invalid promo code",
                        isError: true,
                      });
                    }
                  }}
                >
                  {promoCodeLoading ? <CircularProgress size={24} /> : "Apply"}
                </Button>
              </Box>
              {promoCodeMessage && (
                <Typography
                  color={promoCodeMessage.isError ? "error" : "success"}
                  fontSize={14}
                  mt={1}
                >
                  {promoCodeMessage.text}
                </Typography>
              )}
            </Paper>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: theme.palette.primary.light,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Cart Summary
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={600} fontSize={14}>
                    Item Total
                  </Typography>
                  <Typography fontWeight={600} fontSize={14}>
                    {itemTotal}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={600} fontSize={14}>
                    Discount
                  </Typography>
                  <Typography fontWeight={600} fontSize={14} color="green">
                    {discount === "0₺" ? "0₺" : `-${discount}`}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="h6"
                fontWeight={700}
                mt={2}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Total</span>
                <span>{totalAmount}</span>
              </Typography>
              <Typography variant="caption" color="text.secondary" mt={1}>
                🚚 Delivery in 35–45 Min
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleProceedToCheckout}
              >
                Proceed To Checkout
              </Button>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ShoppingCartPage;
