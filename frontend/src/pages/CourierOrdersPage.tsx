import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Divider,
    Chip,
    Card,
    CardContent,
    Collapse,
    Stack,
    Alert
} from '@mui/material';
import {
    CheckCircle,
    Restaurant,
    Map,
    Phone,
    ExpandMore,
    ExpandLess,
    CalendarToday,
    AccessTime,
    Store,
    PersonOutline,
    ShoppingBag
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CourierOrder } from '../types';
import { getCourierOrderHistory } from '../utils/api';
import Loading from '../components/Loading';

const CourierOrdersPage: React.FC = () => {
    const { t } = useTranslation();
    const [deliveredOrders, setDeliveredOrders] = useState<CourierOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const ordersData = await getCourierOrderHistory();
            setDeliveredOrders(ordersData);
            setError(null);
        } catch (error) {
            console.error('Error fetching courier delivery history:', error);
            setError(t('courier.ordersPage.loadingError'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '';

        try {
            if (Array.isArray(dateValue)) {
                const [year, month, day, hour = 0, minute = 0] = dateValue;
                const date = new Date(year, month - 1, day, hour, minute);
                return date.toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            if (typeof dateValue === 'string') {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }

            if (typeof dateValue === 'number') {
                const date = new Date(dateValue);
                return date.toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            return String(dateValue);
        } catch (error) {
            console.error('Error formatting date:', error, dateValue);
            return String(dateValue);
        }
    };

    const openGoogleMaps = (lat: number, lng: number) => {
        if (!lat || !lng) return;
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    // Get total number of items in an order
    const getTotalItems = (order: CourierOrder): number => {
        if (!order.orderItems || !order.orderItems.length) return 0;
        return order.orderItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Render order cards
    const renderOrderCards = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <Loading />
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ py: 3 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                </Box>
            );
        }

        if (deliveredOrders.length === 0) {
            return (
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        {t('courier.ordersPage.noOrders')}
                    </Typography>
                </Paper>
            );
        }

        return deliveredOrders.map((order) => (
            <Card key={order.orderGroupId} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Restaurant sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography fontWeight={600}>
                                {order.restaurantName}
                            </Typography>
                        </Box>
                        <Chip
                            label={t('courier.ordersPage.status.delivered')}
                            color="success"
                            size="small"
                            icon={<CheckCircle />}
                        />
                    </Box>

                    {/* Basic Order Info */}
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2">
                                {t('courier.ordersPage.orderInfo.orderDate')}: {formatDate(order.orderedDate)}
                            </Typography>
                        </Box>
                        {order.takenOverDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="body2">
                                    {t('courier.ordersPage.orderInfo.pickupTime')}: {formatDate(order.takenOverDate)}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {/* Toggle Button */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            startIcon={expandedOrderId === order.orderGroupId ? <ExpandLess /> : <ExpandMore />}
                            onClick={() => handleToggleExpand(order.orderGroupId)}
                            size="small"
                        >
                            {expandedOrderId === order.orderGroupId
                                ? t('courier.ordersPage.hideDetails')
                                : t('courier.ordersPage.showDetails')}
                        </Button>
                    </Box>
                </CardContent>

                {/* Expandable Details */}
                <Collapse in={expandedOrderId === order.orderGroupId} timeout="auto" unmountOnExit>
                    <Divider />
                    <CardContent>
                        {/* Restaurant Details */}
                        <Typography variant="subtitle2" gutterBottom>
                            {t('courier.ordersPage.restaurant.title')}
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            mb: 1,
                            gap: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Store sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                                <Typography variant="body2">
                                    {order.restaurantName}
                                </Typography>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                alignItems: 'center',
                                width: { xs: '100%', sm: 'auto' },
                                mt: { xs: 1, sm: 0 }
                            }}>
                                {order.restaurantPhone && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Phone />}
                                        href={`tel:+90${order.restaurantPhone}`}
                                        fullWidth={window.innerWidth < 600}
                                    >
                                        {t('courier.ordersPage.restaurant.call')}
                                    </Button>
                                )}

                                {order.restaurantLatitude && order.restaurantLongitude && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        startIcon={<Map />}
                                        onClick={() => openGoogleMaps(order.restaurantLatitude, order.restaurantLongitude)}
                                        fullWidth={window.innerWidth < 600}
                                    >
                                        {t('courier.ordersPage.restaurant.viewOnMap')}
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* Customer & Order Info */}
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PersonOutline sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="body2">
                                    {t('courier.ordersPage.customer.title')}: {order.customerName}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ShoppingBag sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="body2">
                                    {t('courier.ordersPage.customer.totalItems')}: {getTotalItems(order)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Collapse>
            </Card>
        ));
    };

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={700} mb={1} color="text.primary">
                    {t('courier.ordersPage.title')}
                </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {renderOrderCards()}
        </Container>
    );
};

export default CourierOrdersPage;