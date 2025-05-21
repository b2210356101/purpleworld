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
  Skeleton,
  useMediaQuery,
  Stack,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useNavigate } from "react-router-dom";
import {
    viewCart,
    updateItemQuantity,
    removeItemFromCart,
    updateCartGroupNote, checkMinimumAmounts,
} from "../utils/api";
import {
    ViewCartResponse,
    CartGroupResponse,
    CartItemResponse, MinAmountError,
} from "../types";
import { useTranslation } from "react-i18next";

const ShoppingCartPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState<string>("");
  const [minAmountErrors, setMinAmountErrors] = useState<MinAmountError[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data: ViewCartResponse = await viewCart();
      const nonEmptyGroups = data.groups.filter(
        (group) => group.items.length > 0
      );
      const minErrors = await checkMinimumAmounts();setCartItems(nonEmptyGroups);
      setMinAmountErrors(minErrors);
      setItemTotal(`${data.cartTotal}₺`);
      setTotalAmount(`${data.cartTotal}₺`);
    } catch (err) {
      setError(t("cart.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (
      cartItemId: number,
      operation: "+" | "-",
      quantity: number,
      groupId: number,
      restaurantId: number
  ) => {
    try {
      setCartItems((prev) =>
          prev.map((group) => {
            if (group.groupId === groupId) {
              const updatedItems = group.items
                  .map((item) => {
                    if (item.itemId === cartItemId) {
                      if (operation === "-" && quantity === 1) {
                        return null; // Mark for removal
                      }
                      const newQuantity =
                          operation === "+" ? quantity + 1 : quantity - 1;
                      return { ...item, quantity: newQuantity };
                    }
                    return item;
                  })
                  .filter((item): item is CartItemResponse => item !== null);

              return { ...group, items: updatedItems };
            }
            return group;
          }).filter((group) => group.items.length > 0)
      );

      if (operation === "-" && quantity === 1) {
        await removeItemFromCart(cartItemId);
      } else {
        await updateItemQuantity(cartItemId, operation);
      }

      // Fetch updated cart to ensure consistency
      const data = await viewCart();
      const nonEmptyGroups = data.groups.filter(
        (group: { items: any[] }) => group.items.length > 0
      );
      setCartItems(nonEmptyGroups);
      setItemTotal(`${data.cartTotal}₺`);
      setTotalAmount(
          promoCode === "SEPETTE80"
              ? `${data.cartTotal - 80}₺`
              : `${data.cartTotal}₺`
      );

      const minErrors = await checkMinimumAmounts();
      setMinAmountErrors((prev) => {
        const updated = minErrors.find((e) => e.restaurantId === restaurantId);
        const others = prev.filter((e) => e.restaurantId !== restaurantId);
        return updated ? [...others, updated] : others;
      });

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      console.error(t("cart.updateError"), err);
      setError(t("cart.updateError"));
      // Re-fetch cart on error to revert optimistic update
      await fetchCart();
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  const handleNoteChange = async (groupId: number, note: string) => {
    try {
      await updateCartGroupNote(groupId, note);
      setCartItems((prev) =>
          prev.map((group) =>
              group.groupId === groupId ? { ...group, note } : group
          )
      );
    } catch (err) {
      console.error(t('cart.noteUpdateError'), err);
    }
  };

  const handleSaveNote = async () => {
    if (editingGroupId !== null) {
      await handleNoteChange(editingGroupId, editedNote);
      setEditingGroupId(null);
    }
  };

  if (error) {
    return (
        <Container sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
          >
            {t('cart.tryAgain')}
          </Button>
        </Container>
    );
  }

  const hasMinAmountError = minAmountErrors.length > 0;

  return (
      <Container
          sx={{
            py: 4,
            px: isMobile ? 1 : 2, // Reduce padding on mobile
            maxWidth: "md", // Use medium width container for all screens
            mx: "auto" // Center the container
          }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          {t('cart.yourCart')}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {cartItems.length === 0 && !loading ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
              <Typography variant="h6" mb={2}>
                {t('cart.cartIsEmpty')}
              </Typography>
              <Button variant="contained" onClick={() => navigate("/")}>
                {t('cart.continueShopping')}
              </Button>
            </Paper>
        ) : (
            <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap={4}
                alignItems={{ xs: "center", md: "flex-start" }}
                justifyContent="center"
                maxWidth="1100px"
                mx="auto"
            >
              <Box
                  flex={3}
                  width="100%" // Always full width on mobile
                  display="flex"
                  flexDirection="column"
                  gap={4}
                  maxWidth={{ sm: "650px", md: "650px" }}
                  mx="auto"
              >
                {loading ? (
                    // Skeleton for items section during loading
                    <>
                      <Paper
                          sx={{
                            borderRadius: 4,
                            backgroundColor: theme.palette.primary.light,
                            overflow: "hidden",
                            width: "100%",
                          }}
                      >
                        <Skeleton
                            variant="rectangular"
                            height={48}
                            sx={{ bgcolor: theme.palette.primary.main }}
                        />
                        <Box px={isMobile ? 2 : 3} pt={2} pb={3}>
                          {[...Array(2)].map((_, itemIndex) => (
                              <Box
                                  key={itemIndex}
                                  display="flex"
                                  justifyContent="space-between"
                                  gap={2}
                                  sx={{ p: 2, borderRadius: 3, mb: 2 }}
                              >
                                <Skeleton
                                    variant="rectangular"
                                    width={64}
                                    height={64}
                                    sx={{ borderRadius: 2 }}
                                />
                                <Box flex="1 1 200px">
                                  <Skeleton variant="text" width="80%" />
                                  <Skeleton variant="text" width="60%" />
                                </Box>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="flex-end"
                                    gap={1}
                                >
                                  <Skeleton variant="text" width={60} />
                                  <Skeleton
                                      variant="rectangular"
                                      width={100}
                                      height={32}
                                      sx={{ borderRadius: "20px" }}
                                  />
                                </Box>
                              </Box>
                          ))}
                        </Box>
                      </Paper>
                    </>
                ) : (
                    cartItems.map((group) => {

                      const minAmountError = minAmountErrors.find(e => e.restaurantId === group.restaurantId);

                      return (
                          <Paper
                              key={group.restaurantId}
                              sx={{
                                borderRadius: 4,
                                backgroundColor: theme.palette.primary.light,
                                overflow: "hidden",
                                width: "100%",
                                maxWidth: "650px",
                                mx: "auto"
                              }}
                          >
                            <Box
                                sx={{
                                  backgroundColor: theme.palette.primary.main,
                                  color: "white",
                                  px: isMobile ? 2 : 3,
                                  py: 1.5,
                                }}
                            >
                              <Box sx={{display:'flex',justifyContent:'space-between'}}>
                                <Typography fontWeight={600}>
                                  {group.restaurantName}
                                </Typography>
                                <Typography>
                                  {t("cart.minAmount")} {group.minAmount}₺
                                </Typography>
                              </Box>
                            </Box>

                            {minAmountError && (
                                <Box
                                    sx={{
                                      bgcolor: 'rgba(255, 234, 234, 0.7)',
                                      color: 'error.dark',
                                      px: isMobile ? 2 : 3,
                                      py: 1,
                                      fontSize: 13,
                                      fontWeight: 500,
                                      borderTop: '1px solid',
                                      borderColor: 'error.main',
                                      borderBottomLeftRadius: 8,
                                      borderBottomRightRadius: 8,
                                      mt: 0,
                                    }}
                                >
                                  <Typography variant="body2">
                                    {t('cart.minAmountMissing', { amount: minAmountError.restAmount })}
                                  </Typography>
                                </Box>
                            )}

                            <Box px={isMobile ? 2 : 3} pt={2}>
                              {group.items.map((item: CartItemResponse) => (
                                  <Box
                                      key={item.itemId}
                                      display="flex"
                                      justifyContent="space-between"
                                      gap={isMobile ? 1 : 2}
                                      sx={{
                                        p: isMobile ? 1.5 : 2,
                                        borderRadius: 3,
                                        mb: 2,
                                      }}
                                  >
                                    <Box
                                        sx={{
                                          width: isMobile ? 56 : 64,
                                          height: isMobile ? 56 : 64,
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
                                    <Box flex="1 1 100px">
                                      <Typography
                                          fontWeight={600}
                                          fontSize={isMobile ? 14 : 16}
                                      >
                                        {item.itemName}
                                      </Typography>
                                    </Box>

                                    <Box flex="1 1 100px">

                                      {/* Removable Elements gösterimi için eklenecek kod */}
                                      {item.removableElements &&
                                          item.removableElements.length > 0 && (
                                              <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  {t("order.details.removables")}:
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                >
                                                  {item.removableElements.map((removable) => (
                                                      <Chip
                                                          key={removable.id}
                                                          label={removable.name}
                                                          size="small"
                                                          variant="outlined"
                                                          sx={{ mt: 1 }}
                                                      />
                                                  ))}
                                                </Stack>
                                              </Box>
                                          )}
                                    </Box>

                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="flex-end"
                                        justifyContent="space-between"
                                    >
                                      <Typography
                                          fontWeight={700}
                                          color="primary"
                                          fontSize={isMobile ? 14 : 16}
                                      >
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
                                            minWidth: isMobile ? 90 : 100,
                                            justifyContent: "space-between",
                                          }}
                                      >
                                        <IconButton
                                            size="small"
                                            sx={{ color: "white", width: 28, height: 28 }}
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item.itemId,
                                                    "-",
                                                    item.quantity,
                                                    group.groupId,
                                                    group.restaurantId
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
                                              width: 20,
                                              textAlign: "center",
                                              fontWeight: 600,
                                              fontSize: 14,
                                            }}
                                        >
                                          {item.quantity}
                                        </Box>
                                        <IconButton
                                            size="small"
                                            sx={{ color: "white", width: 28, height: 28 }}
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item.itemId,
                                                    "+",
                                                    item.quantity,
                                                    group.groupId,
                                                    group.restaurantId
                                                )
                                            }
                                        >
                                          <AddIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Box>
                              ))}
                              <Box px={isMobile ? 1 : 3} pb={2}>
                                {editingGroupId === group.groupId ? (
                                    <Box display="flex" flexDirection="column" gap={1}>
                                      <TextField
                                          fullWidth
                                          size="small"
                                          label={t('cart.noteForRestaurant')}
                                          value={editedNote}
                                          onChange={(e) => setEditedNote(e.target.value)}
                                          placeholder={t('cart.notePlaceholder')}
                                      />
                                      <Box display="flex" justifyContent="flex-end" gap={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setEditingGroupId(null)}
                                        >
                                          {t('util.cancel')}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleSaveNote}
                                        >
                                          {t('util.save')}
                                        </Button>
                                      </Box>
                                    </Box>
                                ) : (
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                      <Typography fontSize={14} color="text.secondary">
                                        {group.note || t('cart.noNote')}
                                      </Typography>
                                      <IconButton
                                          size="small"
                                          onClick={() => {
                                            setEditedNote(group.note || "");
                                            setEditingGroupId(group.groupId);
                                          }}
                                      >
                                        <EditNoteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                      );
                    })
                )}
              </Box>
              <Box flex={1} display="flex" flexDirection="column" gap={3} width="100%" maxWidth={{ xs: "100%", sm: "400px" }}>
                {loading ? (
                    <>
                      {/* Skeleton for Promo Code Section */}
                      <Paper
                          sx={{
                            p: isMobile ? 2 : 3,
                            borderRadius: 4,
                            backgroundColor: theme.palette.primary.light,
                          }}
                      >
                        <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
                        <Box display="flex" gap={1}>
                          <Skeleton
                              variant="rectangular"
                              height={40}
                              sx={{ flex: 1, borderRadius: 2 }}
                          />
                          <Skeleton variant="rectangular" width={80} height={40} />
                        </Box>
                      </Paper>
                      {/* Skeleton for Cart Summary Section */}
                      <Paper
                          sx={{
                            p: isMobile ? 2 : 3,
                            borderRadius: 4,
                            backgroundColor: theme.palette.primary.light,
                          }}
                      >
                        <Skeleton variant="text" width="50%" sx={{ mb: 2 }} />
                        <Box mb={2}>
                          <Box
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                          >
                            <Skeleton variant="text" width="30%" />
                            <Skeleton variant="text" width="20%" />
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Skeleton variant="text" width="30%" />
                            <Skeleton variant="text" width="20%" />
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            sx={{ mt: 2 }}
                        >
                          <Skeleton variant="text" width="20%" />
                          <Skeleton variant="text" width="20%" />
                        </Box>
                        <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
                        <Skeleton
                            variant="rectangular"
                            height={48}
                            sx={{ mt: 3, borderRadius: 2 }}
                        />
                      </Paper>
                    </>
                ) : (
                    <>
                      <Paper
                          sx={{
                            p: isMobile ? 2 : 3,
                            borderRadius: 4,
                            backgroundColor: theme.palette.primary.light,
                          }}
                      >
                        <Typography fontWeight={600} mb={1}>
                          🏡 {t('cart.promoCode')}
                        </Typography>
                        <Box
                            display="flex"
                            gap={1}
                            flexDirection={isMobile ? "column" : "row"}
                        >
                          <TextField
                              size="small"
                              fullWidth
                              placeholder="SEPETTE80"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              sx={{
                                backgroundColor: "background.default",
                                borderRadius: 2,
                              }}
                          />
                          <Button
                              variant="contained"
                              color="primary"
                              disabled={promoCodeLoading}
                              sx={{
                                minWidth: isMobile ? "100%" : 80,
                                mt: isMobile ? 1 : 0
                              }}
                              onClick={() => {
                                if (promoCode === "SEPETTE80") {
                                  setPromoCodeMessage({
                                    text: t('cart.promoCodeApplied'),
                                    isError: false,
                                  });
                                  setDiscount("80₺");
                                  setTotalAmount(`${parseFloat(itemTotal) - 80}₺`);
                                } else {
                                  setPromoCodeMessage({
                                    text: t('cart.invalidPromoCode'),
                                    isError: true,
                                  });
                                }
                              }}
                          >
                            {promoCodeLoading ? (
                                <CircularProgress size={24} />
                            ) : (
                                t('cart.apply')
                            )}
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
                            p: isMobile ? 2 : 3,
                            borderRadius: 4,
                            backgroundColor: theme.palette.primary.light,
                          }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                          {t('cart.cartSummary')}
                        </Typography>
                        <Box mb={2}>
                          <Box
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                          >
                            <Typography fontWeight={600} fontSize={14}>
                              {t('cart.itemTotal')}
                            </Typography>
                            <Typography fontWeight={600} fontSize={14}>
                              {itemTotal}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography fontWeight={600} fontSize={14}>
                              {t('cart.discount')}
                            </Typography>
                            <Typography
                                fontWeight={600}
                                fontSize={14}
                                color="green"
                            >
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
                          <span>{t('cart.total')}</span>
                          <span>{totalAmount}</span>
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            mt={1}
                        >
                          🚚 {t('cart.deliveryTime', { min: 35, max: 45 })}
                        </Typography>

                        {hasMinAmountError && (
                            <Box
                                sx={{
                                  bgcolor: 'rgba(255, 234, 234, 0.7)',
                                  color: 'error.dark',
                                  px: 2,
                                  py: 1.5,
                                  fontSize: 14,
                                  fontWeight: 500,
                                  borderLeft: '4px solid',
                                  borderColor: 'error.main',
                                  borderRadius: 2,
                                  mt: 2,
                                  mb: 2,
                                }}
                            >
                              <Typography variant="body2">
                                {t('cart.minAmountWarningGlobal')}
                              </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3 }}
                            onClick={handleProceedToCheckout}
                            disabled={hasMinAmountError}
                        >
                          {t('cart.proceedToCheckout')}
                        </Button>
                      </Paper>
                    </>
                )}
              </Box>
            </Box>
        )}
      </Container>
  );
};

export default ShoppingCartPage;
