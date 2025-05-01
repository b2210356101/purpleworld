import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Pagination,
  Chip,
  Container,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { getCustomerOrderHistory, getOrderDetails } from "../utils/api";
import { OrderDTO, OrderGroupDTO, OrderDetailsData, OrderDetails } from "../types";

interface OrderCardProps {
  orderGroup: OrderGroupDTO;
  onDetailsClick: (orderGroup: OrderGroupDTO, parentOrder: OrderDTO) => void;
  parentOrder: OrderDTO;
}

const OrderCard: React.FC<OrderCardProps> = ({ orderGroup, onDetailsClick, parentOrder }) => {
  const theme = useTheme();
  
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status: string) => {
    let chipStyle = {
      backgroundColor: "#E0E0E0",
      color: "#000000"
    };
    let displayStatus = status;
    
    switch (status) {
      case "ORDERED":
        chipStyle = {
          backgroundColor: "#2196F3",
          color: "#FFFFFF"
        };
        break;
      case "PREPARING":
        chipStyle = {
          backgroundColor: "#FF9800",
          color: "#000000"
        };
        break;
      case "READY_FOR_PICKUP":
        chipStyle = {
          backgroundColor: "#673AB7",
          color: "#FFFFFF"
        };
        displayStatus = "READY FOR PICKUP";
        break;
      case "ON_THE_WAY":
        chipStyle = {
          backgroundColor: "#03A9F4",
          color: "#FFFFFF"
        };
        displayStatus = "ON THE WAY";
        break;
      case "DELIVERED":
        chipStyle = {
          backgroundColor: "#4CAF50",
          color: "#FFFFFF"
        };
        break;
      case "REJECTED":
      case "CANCELLED":
        chipStyle = {
          backgroundColor: "#F44336",
          color: "#FFFFFF"
        };
        break;
      default:
        chipStyle = {
          backgroundColor: "#9E9E9E",
          color: "#FFFFFF"
        };
    }
    
    return (
      <Chip 
        label={displayStatus} 
        size="small" 
        style={chipStyle} 
      />
    );
   };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        backgroundColor: 'primary.light',
        borderRadius: 3,
        overflow: "hidden",
        // The theme already applies the shadow to MuiPaper
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Order #{orderGroup.orderGroupId}
        </Typography>
        {getStatusChip(orderGroup.status)}
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              <Avatar
                variant="circular"
                src={orderGroup.img}
                sx={{
                  width: 56,
                  height: 56,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Fallback icon if image fails to load */}
                {!orderGroup.img && <FastfoodIcon sx={{ color: "primary.main" }} />}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {orderGroup.restaurantName}
                </Typography>
                {orderGroup.orderItems && orderGroup.orderItems.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                       {item.name} x{item.quantity}
                    </Typography>
                  </Box>
                ))}
                {orderGroup.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Note: {orderGroup.note}
                  </Typography>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => onDetailsClick(orderGroup, parentOrder)}
                sx={{
                  // Theme already applies borderRadius: '50px' to all buttons
                  "&:hover": {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                Details
              </Button>
              {orderGroup.status === "DELIVERED" && (
                <Button
                  variant="outlined"
                  sx={{
                    // Theme already applies borderRadius: '50px' to all buttons
                    "&:hover": {
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  Review
                </Button>
              )}
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(orderGroup.orderedDate)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {orderGroup.restaurantTotal} ₺
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const MyOrders: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetailsData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const data = await getCustomerOrderHistory();
      console.log('Order history response:', data);
      
      if (Array.isArray(data)) {
        setOrders(data);
        // Reset page to 1 when data is loaded
        setPage(1);
      } else {
        console.error('Unexpected data format:', data);
        setOrders([]);
        setError('Received invalid data format from server');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history. Please try again later.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDetailsClick = async (orderGroup: OrderGroupDTO, parentOrder: OrderDTO) => {
    try {
      setDetailsLoading(true);
      // Fetch detailed order information including address
      const detailedOrderInfo = await getOrderDetails(orderGroup.orderGroupId);
      
      const orderDetails: OrderDetailsData = {
        orderId: parentOrder.orderId,
        date: formatDateTime(detailedOrderInfo.date || orderGroup.orderedDate || parentOrder.orderedDate),
        restaurants: [{
          name: orderGroup.restaurantName,
          items: detailedOrderInfo.items?.map(item => ({
            name: item.name,
            price: `${item.price} ₺`,
            quantity: item.quantity,
          })) || orderGroup.orderItems?.map(item => ({
            name: item.name,
            price: `${item.price} ₺`,
            quantity: item.quantity,
          })) || [],
        }],
        address: {
          name: detailedOrderInfo.addressName || orderGroup.customerName || "N/A",
          address: detailedOrderInfo.addressFull || "Address not available",
          city: detailedOrderInfo.addressCity || "City not available",
        },
        billing: {
          itemTotal: `${orderGroup.restaurantTotal} ₺`,
          discount: "0,00 ₺",
          totalPayment: `${orderGroup.restaurantTotal} ₺`,
        },
      };

      setSelectedOrderDetails(orderDetails);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      // If the detailed info fails, fall back to basic data
      const orderDetails: OrderDetailsData = {
        orderId: parentOrder.orderId,
        date: formatDateTime(orderGroup.orderedDate || parentOrder.orderedDate),
        restaurants: [{
          name: orderGroup.restaurantName,
          items: orderGroup.orderItems?.map(item => ({
            name: item.name,
            price: `${item.price} ₺`,
            quantity: item.quantity,
          })) || [],
        }],
        address: {
          name: orderGroup.customerName || "N/A",
          address: "Address information unavailable",
          city: "N/A",
        },
        billing: {
          itemTotal: `${orderGroup.restaurantTotal} ₺`,
          discount: "0,00 ₺",
          totalPayment: `${orderGroup.restaurantTotal} ₺`,
        },
      };
      setSelectedOrderDetails(orderDetails);
      setModalOpen(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrderDetails(null);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Get all order groups from all orders
  const allOrderGroups = Array.isArray(orders) ? orders.flatMap(order => 
    Array.isArray(order.orderGroups) ? order.orderGroups.map(group => ({ ...group, parentOrder: order })) : []
  ) : [];

  // Paginate order groups
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrderGroups = allOrderGroups.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allOrderGroups.length / itemsPerPage);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={1} color="text.primary">
        My Orders
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {currentOrderGroups.map((orderGroup) => (
        <OrderCard 
          key={`${orderGroup.parentOrder.orderId}-${orderGroup.orderGroupId}`}
          orderGroup={orderGroup} 
          onDetailsClick={handleDetailsClick}
          parentOrder={orderGroup.parentOrder}
        />
      ))}

      {(!orders || orders.length === 0) && (
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          You don't have any orders yet.
        </Typography>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                color: "text.primary",
                fontSize: "1rem",
              },
              "& .Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            }}
          />
        </Box>
      )}

      {selectedOrderDetails && (
        <OrderDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          orderDetails={selectedOrderDetails}
        />
      )}
    </Container>
  );
};

export default MyOrders;