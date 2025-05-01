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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import {
  getActiveOrdersForRestaurant,
  acceptOrder,
  rejectOrder,
  markOrderAsPrepared,
  getRestaurantStats,
} from "../utils/api";
import { OrderGroupDTO, OrderItemDTO } from "../types";

// Stat type
interface Stat {
  value: string | number;
  label: string;
  icon: string;
}

// Review type
interface Review {
  id: number;
  name: string;
  avatar: string;
  date: string;
  text: string;
  rating: number;
}

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
    }, 10000); // 10000 ms = 10 saniye

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

  const handleDetailsClick = (order: OrderGroupDTO) => {
    setIsAnimating(true);
    setSelectedOrder(order);

    if (!isMobile) {
      // Animate width change for desktop - make it narrower to fit details
      setContainerWidth("60%");
      setTimeout(() => {
        setShowDetails(true);
        setIsAnimating(false);
      }, 300); // Match transition duration
    } else {
      setShowDetails(true);
      setIsAnimating(false);
    }
  };

  const handleCloseDetails = () => {
    setIsAnimating(true);
    setShowDetails(false);

    if (!isMobile) {
      // Wait for animation to complete before resetting width
      setTimeout(() => {
        setContainerWidth("100%");
        setIsAnimating(false);
      }, 300); // Match transition duration
    } else {
      setIsAnimating(false);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      await rejectOrder(orderId);
      // Remove the rejected order from the list
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
    let chipStyle = {
      backgroundColor: "#E0E0E0",
      color: "#000000",
    };
    let displayStatus = status;

    switch (status) {
      case "ORDERED":
        chipStyle = {
          backgroundColor: "#2196F3",
          color: "#FFFFFF",
        };
        break;
      case "PREPARING":
        chipStyle = {
          backgroundColor: "#FF9800",
          color: "#000000",
        };
        break;
      case "READY_FOR_PICKUP":
        chipStyle = {
          backgroundColor: "#673AB7",
          color: "#FFFFFF",
        };
        displayStatus = "READY FOR PICKUP";
        break;
      case "ON_THE_WAY":
        chipStyle = {
          backgroundColor: "#03A9F4",
          color: "#FFFFFF",
        };
        displayStatus = "ON THE WAY";
        break;
      case "DELIVERED":
        chipStyle = {
          backgroundColor: "#4CAF50",
          color: "#FFFFFF",
        };
        break;
      case "REJECTED":
      case "CANCELLED":
        chipStyle = {
          backgroundColor: "#F44336",
          color: "#FFFFFF",
        };
        break;
      default:
        chipStyle = {
          backgroundColor: "#9E9E9E",
          color: "#FFFFFF",
        };
    }

    return <Chip label={displayStatus} size="small" style={chipStyle} />;
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Typography
          key={i}
          component="span"
          sx={{ color: i < rating ? "#FFC107" : "#E0E0E0", fontSize: "1rem" }}
        >
          ★
        </Typography>
      );
    }
    return stars;
  };

  const [stats, setStats] = useState<Stat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true); // 👈 yeni

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

  // Reviews
  const reviews: Review[] = [
    {
      id: 1,
      name: "Jons Sena",
      avatar: "https://i.pravatar.cc/150?img=3",
      date: "2 days ago",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text",
      rating: 5,
    },
    {
      id: 2,
      name: "Sofia",
      avatar: "https://i.pravatar.cc/150?img=5",
      date: "2 days ago",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text",
      rating: 5,
    },
    {
      id: 3,
      name: "Anandreansyah",
      avatar: "https://i.pravatar.cc/150?img=8",
      date: "2 days ago",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text",
      rating: 4,
    },
  ];

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
          <Typography variant="h6">Order Details</Typography>
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
              Order #{selectedOrder.orderGroupId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedOrder.orderedDate)}
            </Typography>
            {selectedOrder.status === "PREPARING" && (
              <Typography variant="body2" color="warning.main">
                Preparing since: {formatDate(selectedOrder.preperationDate)}
              </Typography>
            )}
            {selectedOrder.status === "ON_THE_WAY" && (
              <Typography variant="body2" color="success.main">
                On the way since: {formatDate(selectedOrder.takenOverDate)}
              </Typography>
            )}
            {selectedOrder.status === "DELIVERED" && (
              <Typography variant="body2">
                Delivered: {formatDate(selectedOrder.deliveredDate)}
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
                  {item.removables && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Removables: {item.removables}
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
            No items available for this order.
          </Typography>
        )}

        {/* Notes */}
        {selectedOrder.note && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Notes:
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
              items
            </Typography>
            {selectedOrder.status === "ORDERED" && (
              <Typography variant="subtitle2">Reject / Accept</Typography>
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
                Mark as Prepared
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

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

  // Helper function to safely check array existence
  const hasOrders = Array.isArray(orders) && orders.length > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Active Orders Section */}
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        Active Orders
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Container for orders and details with fixed width to prevent overflow */}
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                            items • {formatTime(order.orderedDate)}
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
                            Details
                          </Button>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Typography align="center" sx={{ py: 4 }}>
                      No active orders found
                    </Typography>
                  )}
                </Box>
              ) : (
                /* Desktop view: Full table */
                <TableContainer
                  sx={{
                    flexGrow: 1,
                    overflow: "auto",
                    // Ensure horizontal scrolling works
                    width: "100%",
                  }}
                >
                  <Table stickyHeader sx={{ tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell width="15%">Order #</TableCell>
                        <TableCell width="20%">Customer</TableCell>
                        <TableCell width="10%">Items</TableCell>
                        <TableCell width="15%">Time</TableCell>
                        <TableCell width="20%">Status</TableCell>
                        <TableCell width="20%" align="center">
                          Actions
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
                            <TableCell>{getStatusChip(order.status)}</TableCell>
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
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No active orders found
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

      {/* Statistics Section */}
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, mt: 6 }}>
        Statistics
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {statsLoading ? (
        <Typography>Loading stats…</Typography>
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

      {/* Reviews Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          Last Reviews
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{
              mr: 2,
              color: "#845EC2",
              display: { xs: "none", sm: "block" },
            }}
          >
            View All
          </Typography>
          <IconButton
            size="small"
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

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {reviews.map((review) => (
          <Paper
            key={review.id}
            sx={{
              borderRadius: 3,
              p: 3,
              bgcolor: "primary.light",
              flex: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={review.avatar}
                alt={review.name}
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {review.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {review.date}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {review.text}
            </Typography>
            <Box>{renderStars(review.rating)}</Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default RestaurantDashboard;

