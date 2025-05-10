import React, { useState, useEffect } from "react";
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
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Avatar,
    Pagination,
    Stack,
    Card,
    CardContent,
    CardActions,
    useMediaQuery,
} from "@mui/material";
import {
    Check as CheckIcon,
    Close as CloseIcon,
    AccessTime as TimeIcon,
    ShoppingBasket as BasketIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
    getRestaurantOrders,
    acceptOrder,
    rejectOrder,
    markOrderAsPrepared,
} from "../utils/api";
import { OrderGroupDTO } from "../types";
import Loading from "../components/Loading";

const RestaurantOrderManagement = () => {
    const [orders, setOrders] = useState<OrderGroupDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderGroupDTO | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const ordersData = await getRestaurantOrders();
                setOrders(ordersData);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                const message = err.message || "Failed to load orders. Please try again later.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // Set up interval to refresh orders every 30 seconds
        const interval = setInterval(fetchOrders, 30000);

        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const pageCount = Math.ceil(orders.length / ordersPerPage);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handleDetailsClick = (order: OrderGroupDTO) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
    };

    const handleRejectOrder = async (orderId: number) => {
        try {
            await rejectOrder(orderId);
            // Update the order status to REJECTED
            setOrders(
                orders.map((order) =>
                    order.orderGroupId === orderId
                        ? { ...order, status: "REJECTED", rejectionDate: new Date().toISOString() }
                        : order
                )
            );
            setDetailsOpen(false);
        } catch (err: any) {
            console.error("Error rejecting order:", err);
            const message = err.message || "Failed to reject order. Please try again.";
            setError(message);
        }
    };

    const handleAcceptOrder = async (orderId: number) => {
        try {
            await acceptOrder(orderId);
            setOrders(
                orders.map((order) =>
                    order.orderGroupId === orderId
                        ? { ...order, status: "PREPARING", preperationDate: new Date().toISOString() }
                        : order
                )
            );
            setDetailsOpen(false);
        } catch (err: any) {
            console.error("Error accepting order:", err);
            const message = err.message || "Failed to accept order. Please try again.";
            setError(message);
        }
    };

    const handleMarkAsPrepared = async (orderId: number) => {
        try {
            await markOrderAsPrepared(orderId);
            setOrders(
                orders.map((order) =>
                    order.orderGroupId === orderId
                        ? { ...order, status: "READY_FOR_PICKUP", takenOverDate: new Date().toISOString() }
                        : order
                )
            );
            setDetailsOpen(false);
        } catch (err: any) {
            console.error("Error marking order as prepared:", err);
            const message = err.message || "Failed to mark order as prepared. Please try again.";
            setError(message);
        }
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

    const formatDate = (dateString: string | null) => {
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

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const renderMobileOrderCard = (order: OrderGroupDTO) => (
        <Card key={order.orderGroupId} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ pb: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                    }}
                >
                    <Typography variant="subtitle1" component="div" fontWeight="bold">
                        #{order.orderGroupId}
                    </Typography>
                    {getStatusChip(order.status)}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {order.customerName}
                </Typography>
                <Box sx={{ display: "flex", mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                        <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatTime(order.orderedDate)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BasketIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            {order.orderItems?.length || 0} items
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    fullWidth
                    variant="contained"
                    onClick={() => handleDetailsClick(order)}
                    sx={{ borderRadius: "50px" }}
                >
                    Details
                </Button>
            </CardActions>
        </Card>
    );

    const renderDesktopTable = () => (
        <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Ordered At</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                            <TableRow key={order.orderGroupId} hover>
                                <TableCell>#{order.orderGroupId}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{order.orderItems?.reduce((total, item) => total + item.quantity, 0) || 0}</TableCell>
                                <TableCell>{formatTime(order.orderedDate)}</TableCell>
                                <TableCell>{getStatusChip(order.status)}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleDetailsClick(order)}
                                        sx={{ borderRadius: "50px", px: 3 }}
                                    >
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No orders found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

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

    // Safe map helper function
    const safeMap = (
        array: any[],
        renderFn: (item: any, index: number) => React.ReactNode
    ) => {
        if (!Array.isArray(array)) {
            console.warn("Expected an array but received:", array);
            return null;
        }
        return array.map(renderFn);
    };

    return (
        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                Your Orders
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {loading ? <Loading /> :
                isMobile ? (
                    <Box>
                        {currentOrders.length > 0 ? (
                            safeMap(currentOrders, (order, index) => renderMobileOrderCard(order))
                        ) : (
                            <Typography align="center" sx={{ py: 4 }}>
                                No orders found
                            </Typography>
                        )}
                    </Box>
                ) : (
                    renderDesktopTable()
                )
            }

            {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={handleChangePage}
                        color="primary"
                        shape="rounded"
                        size={isMobile ? "small" : "medium"}
                    />
                </Box>
            )}

            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    flexDirection: isMobile ? "column" : "row",
                                    alignItems: isMobile ? "flex-start" : "center",
                                    gap: isMobile ? 1 : 0,
                                }}
                            >
                                <Typography variant="h6">Order Details</Typography>
                                {getStatusChip(selectedOrder.status)}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{
                                    mb: 3,
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                }}
                            >
                                <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Order #{selectedOrder.orderGroupId}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Ordered: {formatDate(selectedOrder.orderedDate)}
                                    </Typography>
                                    {selectedOrder.status === "REJECTED" && (
                                        <Typography variant="body2" color="error">
                                            Rejected: {formatDate(selectedOrder.rejectionDate)}
                                        </Typography>
                                    )}
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
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: { xs: "flex-start", sm: "flex-end" },
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
                                        {selectedOrder.customerName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body1">
                                        {selectedOrder.customerName}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>
                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                selectedOrder.orderItems.map((item, index) => (
                                    <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "primary.light" }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mb: 1,
                                                flexDirection: isMobile ? "column" : "row",
                                                gap: isMobile ? 1 : 0,
                                            }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {item.name}
                                            </Typography>
                                            <Typography variant="subtitle1">
                                                x{item.quantity}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Price: {item.price.toFixed(2)}TL
                                        </Typography>
                                        {item.removables && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Removables:
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    {item.removables.split(",").map((removable, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={removable.trim()}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Paper>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No detailed items available for this order.
                                </Typography>
                            )}
                            {selectedOrder.note && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Notes:
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: "primary.light" }}>
                                        <Typography variant="body2">{selectedOrder.note}</Typography>
                                    </Paper>
                                </Box>
                            )}
                            <Box
                                sx={{
                                    mt: 3,
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="subtitle1">Total Amount:</Typography>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {selectedOrder.restaurantTotal.toFixed(2)}TL
                                </Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions
                            sx={{
                                px: 3,
                                pb: 3,
                                flexDirection: isMobile ? "column" : "row",
                                alignItems: isMobile ? "stretch" : "center",
                                gap: isMobile ? 2 : 1,
                            }}
                        >
                            {selectedOrder.status === "ORDERED" && (
                                <>
                                    <Button
                                        onClick={() => handleRejectOrder(selectedOrder.orderGroupId)}
                                        color="error"
                                        variant="outlined"
                                        startIcon={<CloseIcon />}
                                        sx={{
                                            borderRadius: "50px",
                                            mr: isMobile ? 0 : 2,
                                            order: isMobile ? 3 : 1,
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAcceptOrder(selectedOrder.orderGroupId)}
                                        color="primary"
                                        variant="contained"
                                        startIcon={<CheckIcon />}
                                        sx={{
                                            borderRadius: "50px",
                                            order: isMobile ? 2 : 2,
                                            mb: isMobile ? 0 : 0,
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        onClick={handleCloseDetails}
                                        color="secondary"
                                        variant="outlined"
                                        sx={{
                                            borderRadius: "50px",
                                            order: isMobile ? 1 : 3,
                                            mt: isMobile ? 0 : 0,
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Close
                                    </Button>
                                </>
                            )}
                            {selectedOrder.status === "PREPARING" && (
                                <>
                                    <Button
                                        onClick={() => handleMarkAsPrepared(selectedOrder.orderGroupId)}
                                        color="primary"
                                        variant="contained"
                                        startIcon={<CheckIcon />}
                                        sx={{
                                            borderRadius: "50px",
                                            order: isMobile ? 2 : 1,
                                            mr: isMobile ? 0 : 2
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Mark as Prepared
                                    </Button>
                                    <Button
                                        onClick={handleCloseDetails}
                                        color="secondary"
                                        variant="outlined"
                                        sx={{
                                            borderRadius: "50px",
                                            order: isMobile ? 1 : 2
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Close
                                    </Button>
                                </>
                            )}
                            {(selectedOrder.status !== "ORDERED" && selectedOrder.status !== "PREPARING") && (
                                <Button
                                    onClick={handleCloseDetails}
                                    color="primary"
                                    variant="contained"
                                    sx={{ borderRadius: "50px" }}
                                    fullWidth={isMobile}
                                >
                                    Close
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default RestaurantOrderManagement;