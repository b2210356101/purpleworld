import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  Alert,
  CircularProgress,
  Pagination,
  Snackbar
} from "@mui/material";
import { OrderDTO, CustomerCurrentOrderDTO, OrderDetailsData, ReviewRequest, ReviewDTO } from "../types";
import { getCustomerOrderHistory, getOrderDetails, submitReview } from "../utils/api";
import OrderDetailsModal from "../components/OrderDetailsModal";
import OrderCard from "../components/OrderCard";
import WriteReviewModal, { ReviewSubmitData } from "../components/customer/WriteReviewModal";
import {useTranslation} from "react-i18next";

// Define an interface that extends CustomerCurrentOrderDTO with parentOrder
interface OrderGroupWithParent extends CustomerCurrentOrderDTO {
  parentOrder: OrderDTO;
  review?: ReviewDTO; // Add the review property as optional
}

const MyOrders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetailsData | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState<CustomerCurrentOrderDTO | null>(null);
  const [selectedParentOrder, setSelectedParentOrder] = useState<OrderDTO | null>(null);
  const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

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
        setPage(1);
      } else {
        console.error(t('myOrders.error.unexpectedFormat'), data);
        setOrders([]);
        setError(t('myOrders.error.invalidFormat'));
      }
      
      setError(null);
    } catch (err) {
      console.error(t('myOrders.error.fetchingHistory'), err);
      setError(t('myOrders.error.failedToLoad'));
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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const formatDateTime = (dateValue: any) => {
  if (!dateValue) return "";
  
  // Check if dateValue is an array
  if (Array.isArray(dateValue)) {
    // Extract year, month, day, hour, minute from array
    const [year, month, day, hour = 0, minute = 0] = dateValue;
    // Create a date (months are 0-indexed in JS Date)
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Handle string format
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  // If all else fails, return a fallback
  return "Cannot fetch date";
};

  const handleDetailsClick = async (orderGroup: CustomerCurrentOrderDTO, parentOrder: OrderDTO) => {
    try {
      setDetailsLoading(true);
      const detailedOrderInfo = await getOrderDetails(orderGroup.orderGroupId);
      
      const orderDetails: OrderDetailsData = {
        orderId: parentOrder.orderId,
        date: formatDateTime(detailedOrderInfo.date || orderGroup.orderedDate || parentOrder.orderedDate),
        restaurants: [{
          name: orderGroup.restaurantName,
          items: detailedOrderInfo.items?.map((item) => ({
            name: item.name,
            price: `${item.price} ₺`,
            quantity: item.quantity
          })) || []
        }],
        address: {
          name: detailedOrderInfo.addressName || t('myOrders.notAvailable'),
          address: detailedOrderInfo.addressFull || t('myOrders.addressNotAvailable'),
          city: detailedOrderInfo.addressCity || t('myOrders.cityNotAvailable'),
        },
        billing: {
          itemTotal: `${orderGroup.totalPrice} ₺`,
          discount: `${detailedOrderInfo.discount}`,
          totalPayment: `${orderGroup.totalPrice-detailedOrderInfo.discount} ₺`
        }
      };

      setSelectedOrderDetails(orderDetails);
      setModalOpen(true);
    } catch (err) {
      console.error(t('myOrders.error.fetchingDetails'), err);
      // If the detailed info fails, fall back to basic data
      const orderDetails: OrderDetailsData = {
        orderId: parentOrder.orderId,
        date: formatDateTime(orderGroup.orderedDate || parentOrder.orderedDate),
        restaurants: [{
          name: orderGroup.restaurantName,
          items: []
        }],
        address: {
            name: t('myOrders.notAvailable'),
            address: t('myOrders.addressInfoUnavailable'),
            city: t('myOrders.notAvailable'),
        },
        billing: {
          itemTotal: `${orderGroup.totalPrice} ₺`,
          discount: "0,00 ₺",
          totalPayment: `${orderGroup.totalPrice} ₺`
        }
      };
      setSelectedOrderDetails(orderDetails);
      setModalOpen(true);
    }
  };

  const handleReviewClick = (orderGroup: CustomerCurrentOrderDTO, parentOrder: OrderDTO) => {
    setSelectedOrderGroup(orderGroup);
    setSelectedParentOrder(parentOrder);
    setReviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrderDetails(null);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedOrderGroup(null);
    setSelectedParentOrder(null);
  };

  const handleReviewSubmit = async (reviewData: ReviewSubmitData) => {
    if (!selectedOrderGroup) return;
    
    try {
      // Create a properly typed ReviewRequest object for the API
      const reviewRequest: ReviewRequest = {
        tasteRating: reviewData.ratings.taste,
        deliveryRating: reviewData.ratings.delivery,
        serviceRating: reviewData.ratings.service,
        review: reviewData.comment
      };
      
      // Submit review to the backend
      await submitReview(selectedOrderGroup.orderGroupId, reviewRequest);
      
      // Update the local state with the submitted review
      const updatedOrders = orders.map(order => ({
        ...order,
        orderGroups: order.orderGroups.map(group => {
          if (group.orderGroupId === selectedOrderGroup.orderGroupId) {
            return {
              ...group,
              review: {
              tasteRating: reviewRequest.tasteRating,
              deliveryRating: reviewRequest.deliveryRating,
              serviceRating: reviewRequest.serviceRating,
              review: reviewRequest.review || '',
              restaurantAnswer: null,
              userName: " ",         // opsiyonel: backend set ediyor
              userAvatar: '',                    // gösterilmiyor ama structure için boş string olabilir
              reviewDate: new Date().toISOString(), // optimistik güncelleme
              orderGroupId : group.orderGroupId
            }
            };
          }
          return group;
        })
      }));
      
      // Update state with updated orders
      setOrders(updatedOrders);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Your review has been submitted successfully!',
        severity: 'success'
      });
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      let errorMessage = 'An error occurred while submitting your review.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data || 'You have already submitted a review for this order.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      // Ensure the modal is closed
      handleCloseReviewModal();
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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

  // Convert OrderGroupDTO objects to CustomerCurrentOrderDTO objects with parent order reference
  const allOrderGroups: OrderGroupWithParent[] = Array.isArray(orders)
    ? orders.flatMap(order =>
        Array.isArray(order.orderGroups)
          ? order.orderGroups.map(group => {
              // Create a properly structured CustomerCurrentOrderDTO object with parent order
              const customerOrder: OrderGroupWithParent = {
                orderGroupId: group.orderGroupId,
                restaurantId: 0, // Default value if not available
                restaurantName: group.restaurantName,
                img: group.img,
                itemCount: group.orderItems?.length || 0,
                totalPrice: group.restaurantTotal,
                status: group.status,
                orderedDate: group.orderedDate,
                estimatedDeliveryTime: "", // Default value if not available
                distanceInKm: 0, // Default value if not available
                parentOrder: order,
                review: group.review
              };
              return customerOrder;
            })
          : []
      )
    : [];

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrderGroups = allOrderGroups.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allOrderGroups.length / itemsPerPage);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={1} color="text.primary">
        {t('myOrders.title')}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {currentOrderGroups.map((orderGroup) => (
        <OrderCard
          key={`${orderGroup.parentOrder.orderId}-${orderGroup.orderGroupId}`}
          orderGroup={orderGroup}
          onDetailsClick={handleDetailsClick}
          onReviewClick={handleReviewClick}
          parentOrder={orderGroup.parentOrder}
        />
      ))}

      {(!orders || orders.length === 0) && (
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          {t('myOrders.noOrders')}
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
                fontSize: "1rem"
              },
              "& .Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark"
                }
              }
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

      {selectedOrderGroup && selectedParentOrder && (
        <WriteReviewModal
          open={reviewModalOpen}
          onClose={handleCloseReviewModal}
          orderGroup={selectedOrderGroup}
          parentOrder={selectedParentOrder}
          onSubmit={handleReviewSubmit}
        />
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyOrders;