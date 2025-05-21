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
}

interface CheckoutSummaryProps {
  cartGroups: CartGroup[];
  totalAmount: number;
  discount: number;
  itemTotal: number;
  loading: boolean;
  processPayment: () => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cartGroups,
  totalAmount,
  discount,
  itemTotal,
  loading,
  processPayment,
}) => {
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
          Cart
        </Typography>
        <Typography color={theme.palette.text.secondary}>
          {totalItems} {totalItems > 1 ? "Items" : "Item"}
        </Typography>
      </Box>

      {/* Restaurant Groups */}
      {cartGroups.map((group, groupIdx) => (
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
                  {(item.price || 0).toFixed(0)}TL
                </Typography>
              </Box>
              <Typography color={theme.palette.text.secondary} fontSize={15}>
                x{(item.quantity || 0).toFixed(0)}
              </Typography>
            </Box>
          ))}

          {groupIdx < cartGroups.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography color={theme.palette.text.secondary} mt={3} mb={2}>
        Bill details
      </Typography>

      {/* totals */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography color={theme.palette.text.secondary}>Item Total</Typography>
        <Typography color={theme.palette.text.secondary}>
          {itemTotal.toFixed(0)}₺
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography color={theme.palette.text.secondary}>Discount</Typography>
        <Typography color={theme.palette.text.secondary}>
          -{discount.toFixed(0)}₺
        </Typography>
      </Box>


      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography
          variant="h6"
          fontWeight={700}
          color={theme.palette.text.primary}
        >
          Total
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          color={theme.palette.text.primary}
        >
          {totalAmount.toFixed(0)}₺
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
          "Proceed To Payment"
        )}
      </Button>
    </Paper>
  );
};

export default CheckoutSummary;
