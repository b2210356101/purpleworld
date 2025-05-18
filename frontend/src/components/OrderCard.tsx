import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  Rating,
  useTheme,
} from "@mui/material";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import { OrderDTO, CustomerCurrentOrderDTO } from "../types";

interface OrderCardProps {
  orderGroup: CustomerCurrentOrderDTO;
  onDetailsClick: (
    orderGroup: CustomerCurrentOrderDTO,
    parentOrder: OrderDTO
  ) => void;
  onReviewClick: (
    orderGroup: CustomerCurrentOrderDTO,
    parentOrder: OrderDTO
  ) => void;
  parentOrder: OrderDTO;
}

const OrderCard: React.FC<OrderCardProps> = ({
  orderGroup,
  onDetailsClick,
  onReviewClick,
  parentOrder,
}) => {
  const theme = useTheme();

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      ORDERED: { bg: "#2196F3", text: "#FFFFFF" },
      PREPARING: { bg: "#FF9800", text: "#000000" },
      READY_FOR_PICKUP: { bg: "#673AB7", text: "#FFFFFF" },
      ON_THE_WAY: { bg: "#03A9F4", text: "#FFFFFF" },
      DELIVERED: { bg: "#4CAF50", text: "#FFFFFF" },
      REJECTED: { bg: "#F44336", text: "#FFFFFF" },
      CANCELLED: { bg: "#F44336", text: "#FFFFFF" },
    };
    const color = colors[status] || { bg: "#9E9E9E", text: "#FFFFFF" };
    const label = status.replace(/_/g, " ");

    return (
      <Chip
        label={label}
        size="small"
        sx={{ bgcolor: color.bg, color: color.text }}
      />
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        mb: 4,
        backgroundColor: "background.paper",
        border: `1px solid ${theme.palette.primary.light}`,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Order #{orderGroup.orderGroupId}
        </Typography>
        {getStatusChip(orderGroup.status)}
      </Box>

      <Divider />

      <Box sx={{ px: 3, py: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <Avatar
          src={orderGroup.img}
          sx={{
            width: 56,
            height: 56,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          {!orderGroup.img && <FastfoodIcon />}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {orderGroup.restaurantName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {orderGroup.itemCount} item{orderGroup.itemCount !== 1 && "s"}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(orderGroup.orderedDate)}
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            {orderGroup.totalPrice} ₺
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onDetailsClick(orderGroup, parentOrder)}
          >
            Details
          </Button>
          {orderGroup.status === "DELIVERED" && !orderGroup.review && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => onReviewClick(orderGroup, parentOrder)}
            >
              Review
            </Button>
          )}
        </Stack>
      </Box>

      {orderGroup.review && (
        <Box sx={{ px: 3, pb: 3 }}>
          {/* User Review Box */}
          <Paper
            variant="outlined"
            sx={{ 
              p: 2, 
              mt: 2, 
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(132, 94, 194, 0.1)' 
                : '#f9f6fd', 
              borderRadius: 2 
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.primary">
              Your Review
            </Typography>

            {/* Ratings with labels */}
            <Stack spacing={1.5} mb={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ width: 70, fontWeight: 500, color: "text.secondary" }}>
                  Taste:
                </Typography>
                <Rating
                  size="small"
                  value={orderGroup.review.tasteRating}
                  readOnly
                  precision={0.5}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ width: 70, fontWeight: 500, color: "text.secondary" }}>
                  Service:
                </Typography>
                <Rating
                  size="small"
                  value={orderGroup.review.serviceRating}
                  readOnly
                  precision={0.5}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ width: 70, fontWeight: 500, color: "text.secondary" }}>
                  Delivery:
                </Typography>
                <Rating
                  size="small"
                  value={orderGroup.review.deliveryRating}
                  readOnly
                  precision={0.5}
                />
              </Box>
            </Stack>

            {/* Review comment */}
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "text.secondary" }}
            >
              "{orderGroup.review.review}"
            </Typography>
          </Paper>

          {/* Restaurant Reply */}
          {orderGroup.review.restaurantAnswer && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(132, 94, 194, 0.2)' 
                  : '#e8def8',
                borderLeft: "4px solid #845EC2",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.light
                    : '#5a2ea6', 
                  mb: 1 
                }}
              >
                Restaurant Reply
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderGroup.review.restaurantAnswer}
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default OrderCard;