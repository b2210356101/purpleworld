import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Define proper TypeScript interfaces
interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
}

interface CartGroup {
  groupId?: string;
  restaurantId?: string;
  restaurantName: string;
  note?: string;
  items: CartItem[];
  calculatedDiscount?: number;
  afterDiscount?: number;
}

interface CheckoutSummaryProps {
  cartGroups: CartGroup[];
  totalAmount: number;
  discount: number;
  itemTotal: number;
  loading: boolean;
  processPayment: () => void;
  couponCode?: string;
  isPercent?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
                                                           cartGroups,
                                                           totalAmount,
                                                           discount,
                                                           itemTotal,
                                                           loading,
                                                           processPayment,
                                                             couponCode,
                                                             isPercent
                                                         }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const totalItems = cartGroups.reduce(
      (sum, group) =>
          sum +
          group.items.reduce(
              (groupSum, item) => groupSum + (item.quantity || 0),
              0
          ),
      0
  );


  return (
      <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: theme.palette.primary.light,
            mx: "auto",
            minWidth: 300,
            maxWidth: 400,
          }}
      >
        {/* header */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography
              variant="h5"
              fontWeight={700}
              color={theme.palette.text.primary}
          >
            {t('checkout.summary.cart')}
          </Typography>
          <Typography color={theme.palette.text.secondary}>
            {totalItems} {totalItems > 1 ? t('checkout.summary.items') : t('checkout.summary.item')}
          </Typography>
        </Box>

        {/* Restaurant Groups */}
          {cartGroups.map((group, groupIdx) => {
              const groupTotal = group.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
              );

              return (
                  <Box key={group.groupId || groupIdx} mb={3}>
                      {/* Restaurant Name */}
                      <Typography
                          fontWeight={800}
                          color={theme.palette.primary.main}
                          mb={1}
                      >
                          {group.restaurantName}
                      </Typography>

                      {/* Items in this restaurant */}
                      {group.items.map((item, idx) => (
                          <Box
                              key={item.id || idx}
                              mb={1.5}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                          >
                              <Box>
                                  <Typography
                                      fontWeight={700}
                                      color={theme.palette.text.primary}
                                      fontSize={16}
                                  >
                                      {item.name}
                                  </Typography>
                                  <Typography color={theme.palette.text.secondary} fontSize={15}>
                                      {(item.price || 0).toFixed(2)}₺
                                  </Typography>
                              </Box>
                              <Typography color={theme.palette.text.secondary} fontSize={15}>
                                  x{(item.quantity || 0).toFixed(0)}
                              </Typography>
                          </Box>
                      ))}

                      {/* Group Total */}
                      <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography fontSize={14} color={theme.palette.text.secondary}>
                              {t('checkout.summary.groupTotal') || 'Group Total'}
                          </Typography>
                          <Typography fontSize={14} color={theme.palette.text.secondary}>
                              {groupTotal.toFixed(2)}₺
                          </Typography>
                      </Box>

                      {/* Group Discount Summary */}
                      {(group.calculatedDiscount ?? 0) > 0 && (
                          <>
                              <Box display="flex" justifyContent="space-between">
                                  <Typography fontSize={14} color={theme.palette.text.secondary}>
                                      {t('checkout.summary.groupDiscount')}
                                  </Typography>
                                  <Typography fontSize={14} color={theme.palette.error.main}>
                                      -{group.calculatedDiscount?.toFixed(2)}₺
                                  </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                  <Typography fontSize={14} fontWeight={600}>
                                      {t('checkout.summary.afterDiscount')}
                                  </Typography>
                                  <Typography fontSize={14} fontWeight={600}>
                                      {group.afterDiscount?.toFixed(2)}₺
                                  </Typography>
                              </Box>
                          </>
                      )}

                      {groupIdx < cartGroups.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
              );
          })}

        <Divider sx={{ my: 2 }} />

        <Typography color={theme.palette.text.secondary} mt={3} mb={2}>
          {t('checkout.summary.billDetails')}
        </Typography>

        {/* totals */}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography color={theme.palette.text.secondary}>{t('checkout.summary.itemTotal')}</Typography>
          <Typography color={theme.palette.text.secondary}>
            {itemTotal.toFixed(2)}₺
          </Typography>
        </Box>

          {discount > 0 && (
              <>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography color={theme.palette.error.main} fontWeight={600}>
                          {t('checkout.summary.discount')}
                          {isPercent ? ` (${discount.toFixed(2)}%)` : ""}
                      </Typography>
                      <Typography color={theme.palette.error.main} fontWeight={600}>
                          -{isPercent ? ((itemTotal * discount) / 100).toFixed(2) : discount.toFixed(2)}₺
                      </Typography>
                  </Box>

                  {couponCode && (
                      <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography color={theme.palette.text.secondary}>
                              {t('checkout.summary.couponCode')}
                          </Typography>
                          <Typography fontWeight={600}>{couponCode}</Typography>
                      </Box>
                  )}
              </>
          )}

        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography
              variant="h6"
              fontWeight={700}
              color={theme.palette.text.primary}
          >
            {t('checkout.summary.total')}
          </Typography>
          <Typography
              variant="h6"
              fontWeight={700}
              color={theme.palette.text.primary}
          >
            {totalAmount.toFixed(2)}₺
          </Typography>
        </Box>

        <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: 16,
            }}
            onClick={processPayment}
            disabled={loading}
        >
          {loading ? (
              <CircularProgress size={24} color="inherit" />
          ) : (
              t('checkout.summary.proceedToPayment')
          )}
        </Button>
      </Paper>
  );
};

export default CheckoutSummary;