import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { OrderDetailsData } from "../types";
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsData;
}

const OrderDetailsModal: React.FC<Props> = ({
  open,
  onClose,
  orderDetails,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const totalItems = orderDetails.restaurants.reduce(
    (sum, restaurant) => sum + restaurant.items.reduce(
      (itemSum, item) => itemSum + item.quantity, 
      0
    ), 
    0
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontSize: 28,
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            {t('orderDetailsModal.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {totalItems} {totalItems > 1 ? t('orderDetailsModal.items') : t('orderDetailsModal.item')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* Date */}
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {t('orderDetailsModal.date')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {orderDetails.date}
          </Typography>
        </Box>

        {/* Items per restaurant */}
        {orderDetails.restaurants.map((group, gi) => (
          <Box key={gi} mb={3}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                fontSize: 18,
                mb: 1.5,
                color: theme.palette.text.primary,
              }}
            >
              <span
                style={{
                  color:
                    group.name === "McBurgers"
                      ? theme.palette.primary.main
                      : theme.palette.primary.main,
                }}
              >
                {group.name}
              </span>
            </Typography>
            {group.items.map((item, ii) => (
              <Box key={ii} mb={1.5}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: 17,
                    mb: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {item.name}
                </Typography>
                <Box display="flex" gap={2}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 16,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {item.price}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 16,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    ×{item.quantity}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ))}

        {/* Delivery Address */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: 24,
            mb: 2,
            mt: 4,
            color: theme.palette.text.primary,
          }}
        >
          {t('orderDetailsModal.deliveryAddress')}
        </Typography>
        <Box
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            bgcolor: theme.palette.primary.light,
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor:
                  theme.palette.mode === "light"
                    ? "#E8EAFF"
                    : theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{
                fontSize: 17,
                color: theme.palette.text.primary,
              }}
            >
              {orderDetails.address.name}
            </Typography>
          </Box>
          <Box pl={7}>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                color: theme.palette.text.secondary,
              }}
            >
              {orderDetails.address.address}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                color: theme.palette.text.secondary,
              }}
            >
              {orderDetails.address.city}
            </Typography>
          </Box>
        </Box>

        {/* Bill Details */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            fontSize: 18,
            mb: 2,
            color: theme.palette.text.secondary,
          }}
        >
          {t('orderDetailsModal.billDetails')}
        </Typography>
        <Box mb={1} display="flex" justifyContent="space-between">
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {t('orderDetailsModal.itemTotal')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {orderDetails.billing.itemTotal}
          </Typography>
        </Box>
        <Box mb={3} display="flex" justifyContent="space-between">
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {t('orderDetailsModal.discount')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          >
            {orderDetails.billing.discount.startsWith("-")
              ? orderDetails.billing.discount
              : `-${orderDetails.billing.discount}`}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              fontSize: 24,
              color: theme.palette.text.primary,
            }}
          >
            {t('orderDetailsModal.totalPayment')}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              fontSize: 24,
              color: theme.palette.text.primary,
            }}
          >
            {orderDetails.billing.totalPayment}
          </Typography>
        </Box>
      </DialogContent>

      <Box sx={{ px: 3, pb: 3, textAlign: "center" }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 16,
            color: theme.palette.text.secondary,
            "&:hover": {
              bgcolor: theme.palette.primary.light,
            },
          }}
        >
          {t('util.close')}
        </Button>
      </Box>
    </Dialog>
  );
};

export default OrderDetailsModal;