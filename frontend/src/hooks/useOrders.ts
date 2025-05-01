import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CustomerOrderSummaryDTO, CustomerCurrentOrderDTO, OrderDetailsData } from '../types';
import { getOrderDetails, cancelOrder, getCurrentOrders } from '../utils/api';
import { parseBackendDate } from '../utils/date';

export const useOrders = () => {
    const [customerOrders, setCustomerOrders] = useState<CustomerOrderSummaryDTO[]>([]);
    const [activeOrderGroups, setActiveOrderGroups] = useState<CustomerCurrentOrderDTO[]>([]);
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetailsData | null>(null);
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<CustomerCurrentOrderDTO | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
    
    const isMounted = useRef(true);
    
    // Debounce API call timer
    const fetchOrdersTimerRef = useRef<number | null>(null);

    // Memoize date formatters to prevent recreation on each render
    const formatOrderDate = useCallback((isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    const formatEstimatedTime = useCallback((isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    const calculateRemainingTime = useCallback((estimatedDeliveryTime: string) => {
        const now = new Date();
        const deliveryTime = new Date(estimatedDeliveryTime);
        const diffInMinutes = Math.round((deliveryTime.getTime() - now.getTime()) / 60000);
        return diffInMinutes > 0 ? `${diffInMinutes} mins` : 'Arriving soon';
    }, []);

    // Memoize order status helper to prevent recreation on each render
    const getOrderSteps = useCallback((status: string) => {
        const steps = [
            { label: 'Confirmed', status: 'completed' },
            { label: 'Preparing', status: 'pending' },
            { label: 'On the way', status: 'pending' },
            { label: 'Delivered', status: 'pending' }
        ];

        const statusUpper = status.toUpperCase();

        if (["PREPARING", "ON_THE_WAY", "DELIVERED", "READY_FOR_PICKUP"].includes(statusUpper)) {
            steps[1].status = 'completed';
        }

        if (["ON_THE_WAY", "DELIVERED"].includes(statusUpper)) {
            steps[2].status = 'completed';
        }

        if (["DELIVERED"].includes(statusUpper)) {
            steps[3].status = 'completed';
        }

        if (["CONFIRMED", "ACCEPTED"].includes(statusUpper)) steps[0].status = 'active';
        else if (statusUpper === "PREPARING") steps[1].status = 'active';
        else if (statusUpper === "ON_THE_WAY") steps[2].status = 'active';

        return steps;
    }, []);

    // Memoize view order details handler
    const handleViewOrderDetails = useCallback(async (orderGroup: CustomerCurrentOrderDTO) => {
        try {
            const orderDetails = await getOrderDetails(orderGroup.orderGroupId);

            const itemTotal = orderDetails.items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0
            );

            const rawDateArr = orderDetails.date as unknown as number[];
            const dateObj = parseBackendDate(rawDateArr);
            const formattedDate = dateObj
                .toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                .replace(/\//g, '.');

            const formattedDetails: OrderDetailsData = {
                orderId: orderDetails.orderId,
                date: formattedDate,
                restaurants: [
                    {
                        name: orderDetails.restaurantName,
                        items: orderDetails.items.map(i => ({
                            name: i.name,
                            price: `${i.price}₺`,
                            quantity: i.quantity
                        }))
                    }
                ],
                address: {
                    name: orderDetails.addressName,
                    address: orderDetails.addressFull,
                    city: orderDetails.addressCity
                },
                billing: {
                    itemTotal: `${itemTotal}₺`,
                    discount: "0₺",
                    totalPayment: `${orderDetails.totalPrice}₺`
                }
            };

            if (isMounted.current) {
                setSelectedOrderDetails(formattedDetails);
                setIsOrderDetailsOpen(true);
            }
        } catch (error) {
            console.error("Failed to load order details:", error);
            if (isMounted.current) {
                setSnackbarMessage("Could not load order details. Please try again.");
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
    }, []);

    // Memoize cancel order handlers
    const handleCancelOrderClick = useCallback((orderGroup: CustomerCurrentOrderDTO) => {
        setOrderToCancel(orderGroup);
        setCancelOrderDialogOpen(true);
    }, []);

    const handleCancelOrder = useCallback(() => {
        if (!orderToCancel) return;

        cancelOrder(orderToCancel.orderGroupId)
            .then(() => {
                if (isMounted.current) {
                    setCancelOrderDialogOpen(false);
                    setSnackbarMessage("Order cancelled successfully!");
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    window.dispatchEvent(new CustomEvent("order-placed"));
                    setActiveOrderGroups((prev) =>
                        prev.filter((og) => og.orderGroupId !== orderToCancel.orderGroupId)
                    );
                }
            })
            .catch((err) => {
                if (isMounted.current) {
                    setCancelOrderDialogOpen(false);
                    setSnackbarMessage("Failed to cancel order. Please try again.");
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }
            });
    }, [orderToCancel]);

    // Improved fetchOrders with debouncing
    const fetchOrders = useCallback(async () => {
        // Clear any existing timer
        if (fetchOrdersTimerRef.current) {
            clearTimeout(fetchOrdersTimerRef.current);
        }
        
        // Set a debounce timeout
        fetchOrdersTimerRef.current = window.setTimeout(async () => {
            if (!isMounted.current) return;
            
            try {
                const response = await getCurrentOrders();
                
                if (!isMounted.current) return;
                
                setCustomerOrders(response);

                const allActiveGroups: CustomerCurrentOrderDTO[] = [];
                if (response && response.length > 0) {
                    for (const order of response) {
                        if (order.orderGroups && order.orderGroups.length > 0) {
                            const nonCancelledGroups = order.orderGroups.filter(group => group.status !== "CANCELLED");
                            allActiveGroups.push(...nonCancelledGroups);
                        }
                    }
                }
                setActiveOrderGroups(allActiveGroups);
            } catch (err) {
                console.error("Failed to load customer orders:", err);
            }
        }, 200); // 200ms debounce
    }, []);

    // Setup lifecycle hooks
    useEffect(() => {
        isMounted.current = true;
        fetchOrders();
        
        // Set up polling interval for order updates
        const ordersRefreshInterval = setInterval(() => {
            fetchOrders();
        }, 10000); // Every 10 seconds

        // Cleanup function
        return () => {
            isMounted.current = false;
            if (fetchOrdersTimerRef.current) {
                clearTimeout(fetchOrdersTimerRef.current);
            }
            clearInterval(ordersRefreshInterval);
        };
    }, [fetchOrders]);

    // Listen for order-placed event
    useEffect(() => {
        const handleOrderPlaced = () => {
            fetchOrders();
        };

        window.addEventListener("order-placed", handleOrderPlaced);
        
        return () => {
            window.removeEventListener("order-placed", handleOrderPlaced);
        };
    }, [fetchOrders]);

    return {
        customerOrders,
        activeOrderGroups,
        isOrderDetailsOpen,
        selectedOrderDetails,
        cancelOrderDialogOpen,
        orderToCancel,
        snackbarOpen,
        snackbarMessage,
        snackbarSeverity,
        formatOrderDate,
        formatEstimatedTime,
        calculateRemainingTime,
        getOrderSteps,
        handleViewOrderDetails,
        handleCancelOrderClick,
        handleCancelOrder,
        setIsOrderDetailsOpen,
        setSnackbarOpen,
        setCancelOrderDialogOpen
    };
};