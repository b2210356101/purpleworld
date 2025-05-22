import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Avatar,
  Chip,
  IconButton,
  useMediaQuery,
  Slide,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { Rating } from "@mui/material";
import theme from "../theme";
import {
  getActiveOrdersForRestaurant,
  acceptOrder,
  rejectOrder,
  markOrderAsPrepared,
  getRestaurantStats,
  getRestaurantReviews, // Add this import
} from "../utils/api";
import { OrderGroupDTO, Stat, ReviewDTO } from "../types"; // Add ReviewDTO import
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState<OrderGroupDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderGroupDTO | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [containerWidth, setContainerWidth] = useState<string>("100%");
  const [isAnimating, setIsAnimating] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Reviews state - replace hardcoded reviews with real data
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getActiveOrdersForRestaurant();
        const activeOrders = ordersData.filter(
          (order) => order.status !== "REJECTED"
        );
        setOrders(activeOrders);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        const message = err.message || "Failed to load orders.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 10000);

    const handleOrderPlaced = () => {
      console.log("Order placed event received");
      fetchOrders();
    };
    window.addEventListener("order-placed", handleOrderPlaced);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("order-placed", handleOrderPlaced);
    };
  }, []);

  // Fetch real reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const reviewsData = await getRestaurantReviews();
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDetailsClick = (order: OrderGroupDTO) => {
    setIsAnimating(true);
    setSelectedOrder(order);

    if (!isMobile) {
      setContainerWidth("60%");
      setTimeout(() => {
        setShowDetails(true);
        setIsAnimating(false);
      }, 300);
    } else {
      setShowDetails(true);
      setIsAnimating(false);
    }
  };

  const handleCloseDetails = () => {
    setIsAnimating(true);
    setShowDetails(false);

    if (!isMobile) {
      setTimeout(() => {
        setContainerWidth("100%");
        setIsAnimating(false);
      }, 300);
    } else {
      setIsAnimating(false);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      await rejectOrder(orderId);
      setOrders(orders.filter((order) => order.orderGroupId !== orderId));
      handleCloseDetails();
    } catch (err: any) {
      console.error("Error rejecting order:", err);
      const message =
        err.message || "Failed to reject order. Please try again.";
      setError(message);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await acceptOrder(orderId);
      setOrders(
        orders.map((order) =>
          order.orderGroupId === orderId
            ? {
                ...order,
                status: "PREPARING",
                preperationDate: new Date().toISOString(),
              }
            : order
        )
      );
      handleCloseDetails();
    } catch (err: any) {
      console.error("Error accepting order:", err);
      const message =
        err.message || "Failed to accept order. Please try again.";
      setError(message);
    }
  };

  const handleMarkAsPrepared = async (orderId: number) => {
    try {
      await markOrderAsPrepared(orderId);
      setOrders(
        orders.map((order) =>
          order.orderGroupId === orderId
            ? {
                ...order,
                status: "READY_FOR_PICKUP",
                takenOverDate: new Date().toISOString(),
              }
            : order
        )
      );
      handleCloseDetails();
    } catch (err: any) {
      console.error("Error marking order as prepared:", err);
      const message =
        err.message || "Failed to mark order as prepared. Please try again.";
      setError(message);
    }
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

    return (
      <Chip
        label={t(`orderCard.status.${status}`)}
        size="small"
        sx={{ bgcolor: color.bg, color: color.text }}
      />
    );
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (dateValue: any): string => {
    try {
      // Get current locale from i18n
      const locale = i18n.language === "tr" ? "tr-TR" : "en-US";

      if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute, second);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      } else if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }
      console.warn("Could not parse date:", dateValue);
      return t("restaurantReviewManagement.unknownDate");
    } catch (error) {
      console.error("Error parsing date:", error);
      return t("restaurantReviewManagement.unknownDate");
    }
  };

  // Calculate average rating from ReviewDTO
  const calculateAverageRating = (review: ReviewDTO): number => {
    return Math.round(
      (review.tasteRating + review.deliveryRating + review.serviceRating) / 3
    );
  };

  // Rating color based on rating value
  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "#4CAF50";
    if (rating >= 3.5) return "#8BC34A";
    if (rating >= 2.5) return "#FFC107";
    if (rating >= 1.5) return "#FF9800";
    return "#F44336";
  };

  // Render star rating with Material-UI Rating component
  const renderStars = (rating: number) => {
    return (
      <Rating
        value={rating}
        readOnly
        size="small"
        sx={{
          "& .MuiRating-iconFilled": {
            color: "#FFC107",
          },
          "& .MuiRating-iconEmpty": {
            color: "#E0E0E0",
          },
        }}
      />
    );
  };

  // Review navigation functions
  const handlePreviousReview = () => {
    if (reviews.length > 0) {
      setCurrentReviewIndex((prev) =>
        prev === 0 ? Math.max(0, reviews.length - 3) : Math.max(0, prev - 3)
      );
    }
  };

  const handleNextReview = () => {
    if (reviews.length > 0) {
      setCurrentReviewIndex((prev) =>
        prev + 3 >= reviews.length ? 0 : prev + 3
      );
    }
  };

  // Get visible reviews (3 at a time)
  const getVisibleReviews = () => {
    if (reviews.length === 0) return [];
    return reviews.slice(currentReviewIndex, currentReviewIndex + 3);
  };

  const [stats, setStats] = useState<Stat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const s = await getRestaurantStats();
        setStats(s);
      } catch (e) {
        console.error("Error fetching stats", e);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Order details component
  const OrderDetailsContent = () => {
    if (!selectedOrder) return null;

    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{t("order.details.title")}</Typography>
          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {t("order.details.number", { id: selectedOrder.orderGroupId })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedOrder.orderedDate)}
            </Typography>
            {selectedOrder.status === "PREPARING" && (
              <Typography variant="body2" color="warning.main">
                {t("order.details.preparingSince")}:{" "}
                {formatDate(selectedOrder.preperationDate)}
              </Typography>
            )}
            {selectedOrder.status === "ON_THE_WAY" && (
              <Typography variant="body2" color="success.main">
                {t("order.details.onTheWaySince")}:{" "}
                {formatDate(selectedOrder.takenOverDate)}
              </Typography>
            )}
            {selectedOrder.status === "DELIVERED" && (
              <Typography variant="body2">
                {t("order.details.delivered")}:{" "}
                {formatDate(selectedOrder.deliveredDate)}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
            {selectedOrder.customerName?.charAt(0) || "?"}
          </Avatar>
        </Box>

        {/* Order Items */}
        {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
          selectedOrder.orderItems.map((item, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                boxShadow: "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.name}
                  </Typography>
                  {item.removableElements &&
                    item.removableElements.length > 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {t("order.details.removables")}:{" "}
                        {item.removableElements.map((el) => el.name).join(", ")}
                      </Typography>
                    )}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ ml: 2 }}
                  >
                    x{item.quantity}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("order.details.noItems")}
          </Typography>
        )}

        {/* Notes */}
        {selectedOrder.note && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("order.details.notes")}:
            </Typography>
            <Typography variant="body2">{selectedOrder.note}</Typography>
          </Box>
        )}

        {/* Total items and actions */}
        <Box sx={{ mt: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle2">
              {selectedOrder.orderItems?.reduce(
                (total, item) => total + item.quantity,
                0
              ) || 0}{" "}
              {t("order.details.items")}
            </Typography>
            {selectedOrder.status === "ORDERED" && (
              <Typography variant="subtitle2">
                {t("order.actions.rejectAccept")}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            {selectedOrder.status === "ORDERED" && (
              <>
                <IconButton
                  onClick={() => handleRejectOrder(selectedOrder.orderGroupId)}
                  sx={{
                    bgcolor: "#FFCDD2",
                    color: "#FF1744",
                    "&:hover": { bgcolor: "#FFCDD2", opacity: 0.9 },
                    width: 40,
                    height: 40,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleAcceptOrder(selectedOrder.orderGroupId)}
                  sx={{
                    bgcolor: "#E8F5E9",
                    color: "#4CAF50",
                    "&:hover": { bgcolor: "#E8F5E9", opacity: 0.9 },
                    width: 40,
                    height: 40,
                  }}
                >
                  <CheckIcon />
                </IconButton>
              </>
            )}
            {selectedOrder.status === "PREPARING" && (
              <Button
                onClick={() => handleMarkAsPrepared(selectedOrder.orderGroupId)}
                variant="contained"
                color="primary"
                sx={{ borderRadius: "50px" }}
              >
                {t("order.actions.markAsPrepared")}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const hasOrders = Array.isArray(orders) && orders.length > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Active Orders Section */}
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        {t("dashboard.activeOrders")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Loading />
      ) : (
        <Box
          sx={{
            display: "flex",
            position: "relative",
            gap: 3,
            height: { md: "600px" },
            width: "100%",
            overflow: "visible",
          }}
        >
          {/* Orders Table with animation */}
          <Box
            sx={{
              width: containerWidth,
              transition: "width 0.3s ease-out",
              flexShrink: 0,
              minWidth: isMobile ? "auto" : "600px",
            }}
          >
            <Paper
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                height: { xs: "auto", md: "100%" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Mobile view: Simplified table */}
                {isMobile ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {hasOrders ? (
                      orders.map((order) => (
                        <Paper
                          key={order.orderGroupId}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold">
                              #{order.orderGroupId} - {order.customerName}
                            </Typography>
                            {getStatusChip(order.status)}
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {order.orderItems?.reduce(
                                (total, item) => total + item.quantity,
                                0
                              ) || 0}{" "}
                              {t("order.details.items")} •{" "}
                              {formatTime(order.orderedDate)}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleDetailsClick(order)}
                              disabled={isAnimating}
                              sx={{
                                borderRadius: "50px",
                                px: 2,
                                py: 0.5,
                                fontSize: "0.75rem",
                                bgcolor: "#845EC2",
                                "&:hover": {
                                  bgcolor: "#6d4ba1",
                                },
                              }}
                            >
                              {t("util.details")}
                            </Button>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Typography align="center" sx={{ py: 4 }}>
                        {t("dashboard.noActiveOrders")}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  /* Desktop view: Full table */
                  <TableContainer
                    sx={{
                      flexGrow: 1,
                      overflow: "auto",
                      width: "100%",
                    }}
                  >
                    <Table stickyHeader sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell width="15%">
                            {t("order.table.orderNumber")}
                          </TableCell>
                          <TableCell width="20%">
                            {t("order.table.customer")}
                          </TableCell>
                          <TableCell width="10%">
                            {t("order.table.items")}
                          </TableCell>
                          <TableCell width="15%">
                            {t("order.table.time")}
                          </TableCell>
                          <TableCell width="20%">
                            {t("order.table.status")}
                          </TableCell>
                          <TableCell width="20%" align="center">
                            {t("order.table.actions")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {hasOrders ? (
                          orders.map((order) => (
                            <TableRow key={order.orderGroupId} hover>
                              <TableCell>#{order.orderGroupId}</TableCell>
                              <TableCell>{order.customerName}</TableCell>
                              <TableCell>
                                {order.orderItems?.reduce(
                                  (total, item) => total + item.quantity,
                                  0
                                ) || 0}
                              </TableCell>
                              <TableCell>
                                {formatTime(order.orderedDate)}
                              </TableCell>
                              <TableCell>
                                {getStatusChip(order.status)}
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleDetailsClick(order)}
                                  disabled={isAnimating}
                                  sx={{
                                    borderRadius: "50px",
                                    px: 3,
                                    bgcolor: "#845EC2",
                                    "&:hover": {
                                      bgcolor: "#6d4ba1",
                                    },
                                  }}
                                >
                                  {t("util.details")}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              {t("dashboard.noActiveOrders")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Order Details with Slide Animation - Desktop only */}
          {!isMobile && (
            <Slide direction="left" in={showDetails} mountOnEnter unmountOnExit>
              <Box
                sx={{
                  width: "38%",
                  flexShrink: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <Paper
                  sx={{
                    borderRadius: 3,
                    overflow: "auto",
                    height: "100%",
                  }}
                >
                  <OrderDetailsContent />
                </Paper>
              </Box>
            </Slide>
          )}

          {/* Mobile Slide-up for Order Details */}
          {isMobile && (
            <Slide direction="up" in={showDetails} mountOnEnter unmountOnExit>
              <Box
                sx={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  maxHeight: "80vh",
                  zIndex: 1300,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  overflow: "auto",
                }}
              >
                <Paper
                  sx={{
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    height: "100%",
                  }}
                >
                  <OrderDetailsContent />
                </Paper>
              </Box>
            </Slide>
          )}
        </Box>
      )}

      {/* Statistics Section */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, mt: 6 }}>
        {t("dashboard.statistics")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {statsLoading ? (
        <Loading />
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 6 }}>
          {stats.map((stat) => (
            <Paper
              key={stat.label}
              sx={{
                borderRadius: 3,
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 3,
                flex: {
                  xs: "1 0 calc(100% - 24px)",
                  sm: "1 0 calc(50% - 24px)",
                  md: "1 0 calc(25% - 24px)",
                },
                bgcolor: "primary.light",
              }}
            >
              <Box
                sx={{
                  bgcolor: "background.default",
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                {stat.icon ?? "📊"}
              </Box>

              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Reviews Section - Updated with consistent width */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          {t("dashboard.lastReviews")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{
              mr: 2,
              color: "#845EC2",
              display: { xs: "none", sm: "block" },
              cursor: "pointer",
              textDecoration: "underline",
              "&:hover": { color: "#6d4ba1" },
            }}
            onClick={() => navigate("/restaurant/reviews")}
          >
            {t("dashboard.viewAll")}
          </Typography>
          <IconButton
            size="small"
            onClick={handlePreviousReview}
            disabled={reviews.length <= 3}
            sx={{
              bgcolor: "#EDE7F6",
              mr: 1,
              "&:hover": { bgcolor: "#D1C4E9" },
              width: 32,
              height: 32,
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNextReview}
            disabled={reviews.length <= 3}
            sx={{
              bgcolor: "#EDE7F6",
              "&:hover": { bgcolor: "#D1C4E9" },
              width: 32,
              height: 32,
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {reviewsLoading ? (
        <Loading />
      ) : reviews.length === 0 ? (
        <Paper
          sx={{
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            bgcolor: "primary.light",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t("restaurantReviews.noReviews", "No reviews yet")}
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            flexWrap: "wrap", // Allow wrapping for responsiveness
            justifyContent: "flex-start", // Align reviews to the start
          }}
        >
          {getVisibleReviews().map((review) => (
            <Paper
              key={review.orderGroupId}
              sx={{
                borderRadius: 3,
                p: 3,
                bgcolor: "primary.light",
                flex: { xs: "1 0 100%", md: "0 0 calc(33.333% - 16px)" }, // Fixed width: 1/3 minus gap
                maxWidth: { md: "calc(33.333% - 16px)" }, // Ensure max width matches 1/3
                minWidth: { md: "300px" }, // Minimum width for readability
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={review.userAvatar || undefined}
                  alt={review.userName}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  {review.userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {review.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(review.reviewDate)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {review.review ||
                  t("dashboard.noReviewText", "No review text provided")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.light, 0.1),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 60,
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                  >
                    {t("restaurantReviews.ratings.taste")}:
                  </Typography>
                  <Rating
                    value={review.tasteRating}
                    readOnly
                    precision={0.5}
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: getRatingColor(review.tasteRating),
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 60,
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                  >
                    {t("restaurantReviews.ratings.service")}:
                  </Typography>
                  <Rating
                    value={review.serviceRating}
                    readOnly
                    precision={0.5}
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: getRatingColor(review.serviceRating),
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 60,
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                  >
                    {t("restaurantReviews.ratings.delivery")}:
                  </Typography>
                  <Rating
                    value={review.deliveryRating}
                    readOnly
                    precision={0.5}
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: getRatingColor(review.deliveryRating),
                      },
                    }}
                  />
                </Box>
              </Box>
              {review.restaurantAnswer && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ mb: 1 }}
                  >
                    {t("restaurantReviews.restaurantReply")}:
                  </Typography>
                  <Typography variant="body2">
                    {review.restaurantAnswer}
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RestaurantDashboard;
