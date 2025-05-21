import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// PaymentSuccessPopup.tsx
interface OrderSuccessProps {
  open: boolean;
  onClose: () => void;
  orderData: {
    orderId: number;
    status: string;
    totalPrice: number;
    estimatedDuration: string;
    paymentType: string;
    note?: string;
  } | null;
}

const PaymentSuccessPopup: React.FC<OrderSuccessProps> = ({
  open,
  onClose,
  orderData
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoHome = () => {
    onClose();
    navigate("/"); // Navigate to home page
  };

  if (!orderData) return null;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString(
    i18n.language === 'tr' ? 'tr-TR' : 'en-US', 
    { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxWidth: 400,
          width: "100%",
          mx: 2,
          boxShadow: '0px 0px 20px rgba(132, 94, 194, 0.3)',
        }
      }}
    >
      <DialogContent sx={{ py: 4, px: 4 }}>
        {/* Success Icon */}
        <Box
          display="flex"
          justifyContent="center"
          mb={2}
          sx={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: theme.palette.primary.light,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 24px"
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main
            }}
          />
        </Box>

        {/* Success Title */}
        <Typography
          align="center"
          variant="h5"
          fontWeight={600}
          color={theme.palette.text.primary}
          mb={2}
        >
          {t('payment.success.title')}
        </Typography>

        {/* Total Amount */}
        <Typography
          align="center"
          variant="h3"
          fontWeight={700}
          mb={4}
          color={theme.palette.text.primary}
        >
          {orderData.totalPrice}₺
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Order Details */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography color={theme.palette.text.secondary}>{t('payment.details.refNumber')}</Typography>
            <Typography fontWeight={500} color={theme.palette.text.primary}>
              {String(orderData.orderId).padStart(13, '0')}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography color={theme.palette.text.secondary}>{t('payment.details.paymentTime')}</Typography>
            <Typography fontWeight={500} color={theme.palette.text.primary}>
              {formattedDate}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography color={theme.palette.text.secondary}>{t('payment.details.paymentMethod')}</Typography>
            <Typography fontWeight={500} color={theme.palette.text.primary}>
              {orderData.paymentType === "cash" 
                ? t('payment.methods.cash') 
                : t('payment.methods.creditCard')}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography color={theme.palette.text.secondary}>{t('payment.details.totalAmount')}</Typography>
            <Typography fontWeight={500} color={theme.palette.text.primary}>
              {orderData.totalPrice}₺
            </Typography>
          </Box>

          {orderData.estimatedDuration && (
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography color={theme.palette.text.secondary}>{t('payment.details.estimatedDelivery')}</Typography>
              <Typography fontWeight={500} color={theme.palette.text.primary}>
                {orderData.estimatedDuration}
              </Typography>
            </Box>
          )}

          {/* Note Section - Added */}
          {orderData.note && (
            <Box mt={2}>
              <Typography color={theme.palette.text.secondary} mb={1}>
                {t('payment.details.orderNotes')}:
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.primary.light, 
                  borderRadius: 2,
                  wordBreak: 'break-word'
                }}
              >
                <Typography fontWeight={400} color={theme.palette.text.primary}>
                  {orderData.note}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleGoHome}
          sx={{
            py: 1.5,
            borderRadius: 50,
            fontWeight: 600
          }}
        >
          {t('payment.close')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessPopup;