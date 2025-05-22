import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Stack,
  Divider,
} from "@mui/material";
import {
  LocalOffer as CouponIcon,
  ContentCopy as CopyIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  Percent as PercentIcon,
  CheckCircle as CheckIcon,
  CardGiftcard as GiftIcon,
  AccessTime as ClockIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

import { getAllCouponsforCustomer } from "../utils/api";
import { CouponResponse } from "../types";

const CouponsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCouponsforCustomer();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setError(t('coupons.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setSnackbarOpen(true);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const activeCoupons = coupons.filter(
    (coupon) => coupon.isActive && !isExpired(coupon.expiryDate)
  );
  const expiredCoupons = coupons.filter(
    (coupon) => !coupon.isActive || isExpired(coupon.expiryDate)
  );

  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress 
            size={48} 
            sx={{ 
              color: "primary.main",
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {t('coupons.loading')}
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: "center", 
            maxWidth: 500,
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {t('coupons.errorTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={fetchCoupons}
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.32)}`,
              }
            }}
          >
            {t('coupons.errorRetry')}
          </Button>
        </Paper>
      </Box>
    );
  }

  const CouponCard = ({
    coupon,
    isExpired = false,
  }: {
    coupon: CouponResponse;
    isExpired?: boolean;
  }) => (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        opacity: isExpired ? 0.6 : 1,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: isExpired 
          ? `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`
          : `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "visible",
        "&:hover": {
          transform: !isExpired ? "translateY(-6px)" : "none",
          boxShadow: !isExpired
            ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.16)}`
            : "inherit",
        },
        "&::before": !isExpired ? {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: "12px 12px 0 0",
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        } : {},
      }}
    >
      <CardContent sx={{ p: 3, height: "100%" }}>
        {/* Status Chip */}
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <Chip
            label={isExpired ? t('coupons.statusExpired') : t('coupons.statusActive')}
            color={isExpired ? "error" : "success"}
            size="small"
            sx={{ 
              fontWeight: 600,
              borderRadius: 2,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Discount Badge */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, mt: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: isExpired
                ? alpha(theme.palette.text.disabled, 0.08)
                : alpha(theme.palette.primary.main, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${isExpired 
                ? alpha(theme.palette.text.disabled, 0.16)
                : alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            {coupon.isPercent ? (
              <PercentIcon
                sx={{
                  color: isExpired ? "text.disabled" : "primary.main",
                  fontSize: 30,
                }}
              />
            ) : (
              <MoneyIcon
                sx={{
                  color: isExpired ? "text.disabled" : "primary.main",
                  fontSize: 30,
                }}
              />
            )}
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color={isExpired ? "text.disabled" : "primary.main"}
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem' },
                lineHeight: 1.2,
              }}
            >
              {coupon.isPercent
                ? `${coupon.discountAmount}%`
                : `₺${coupon.discountAmount}`}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              {t('coupons.discountOff')}
            </Typography>
          </Box>
        </Stack>

        {/* Description */}
        <Typography
          variant="body2"
          color={isExpired ? "text.disabled" : "text.primary"}
          sx={{ 
            mb: 3, 
            lineHeight: 1.6,
            fontSize: '0.9rem',
            fontWeight: 400,
          }}
        >
          {coupon.description}
        </Typography>

        {/* Coupon Code */}
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: isExpired
              ? alpha(theme.palette.text.disabled, 0.04)
              : alpha(theme.palette.primary.main, 0.06),
            border: `2px dashed`,
            borderColor: isExpired ? "text.disabled" : alpha(theme.palette.primary.main, 0.32),
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {t('coupons.couponCode')}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontFamily: "ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
                  color: isExpired ? "text.disabled" : "text.primary",
                  fontSize: '1.1rem',
                  letterSpacing: 1,
                }}
              >
                {coupon.code}
              </Typography>
            </Box>
            {!isExpired && (
              <IconButton
                onClick={() => copyToClipboard(coupon.code)}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  width: 44,
                  height: 44,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.32)}`,
                  "&:hover": {
                    bgcolor: "primary.dark",
                    transform: "scale(1.05)",
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {copiedCode === coupon.code ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            )}
          </Stack>
        </Paper>

        {/* Details */}
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <MoneyIcon
              sx={{
                fontSize: 18,
                color: isExpired ? "text.disabled" : "text.secondary",
              }}
            />
            <Typography
              variant="body2"
              color={isExpired ? "text.disabled" : "text.secondary"}
              sx={{ fontWeight: 500 }}
            >
              {t('coupons.minOrder')}: ₺{coupon.minOrderPrice}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CalendarIcon
              sx={{
                fontSize: 18,
                color: isExpired ? "text.disabled" : "text.secondary",
              }}
            />
            <Typography
              variant="body2"
              color={isExpired ? "text.disabled" : "text.secondary"}
              sx={{ fontWeight: 500 }}
            >
              {isExpired ? t('coupons.expired') : t('coupons.validUntil')}:{" "}
              {formatExpiryDate(coupon.expiryDate)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Paper
        sx={{
          bgcolor: "background.paper",
          borderRadius: 4,
          mb: 4,
          mx: 2,
          mt: 2,
          boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GiftIcon
                  sx={{
                    fontSize: 32,
                    color: "primary.main",
                  }}
                />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  color="text.primary"
                  sx={{ 
                    fontSize: { xs: '1.75rem', sm: '2.5rem' },
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {t('coupons.title')}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {t('coupons.subtitle')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        {/* Active Coupons */}
        {activeCoupons.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: 3 }}
            >
              <CouponIcon sx={{ color: "success.main", fontSize: 28 }} />
              <Typography 
                variant="h5" 
                fontWeight={700} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                {t('coupons.availableCoupons')} ({activeCoupons.length})
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {activeCoupons.map((coupon) => (
                <Box
                  key={coupon.id || coupon.code}
                  sx={{ flex: "1 1 340px", minWidth: 300, maxWidth: 420 }}
                >
                  <CouponCard coupon={coupon} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Expired Coupons */}
        {expiredCoupons.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: 3 }}
            >
              <ClockIcon sx={{ color: "text.disabled", fontSize: 28 }} />
              <Typography 
                variant="h5" 
                fontWeight={700} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                {t('coupons.expiredCoupons')} ({expiredCoupons.length})
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {expiredCoupons.map((coupon) => (
                <Box
                  key={coupon.id || coupon.code}
                  sx={{ flex: "1 1 340px", minWidth: 300, maxWidth: 420 }}
                >
                  <CouponCard coupon={coupon} isExpired />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* No Coupons Available */}
        {activeCoupons.length === 0 && expiredCoupons.length === 0 && (
          <Paper 
            sx={{ 
              p: 8, 
              textAlign: "center",
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.04)}`,
            }}
          >
            <GiftIcon
              sx={{
                fontSize: 80,
                color: "text.disabled",
                mb: 2,
              }}
            />
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 2 }}
            >
              {t('coupons.noCouponsTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t('coupons.noCouponsMessage')}
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ 
            width: "100%",
            borderRadius: 2,
            fontWeight: 500,
          }}
          icon={<CheckIcon />}
        >
          {t('coupons.copySuccess')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CouponsPage;