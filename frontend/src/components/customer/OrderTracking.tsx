import React from 'react';
import { Box, Typography, Paper, Avatar, Button, Stack } from '@mui/material';
import { CustomerCurrentOrderDTO } from '../../types';
import { CircleRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface OrderTrackingProps {
    activeOrderGroups: CustomerCurrentOrderDTO[];
    getOrderSteps: (status: string) => { label: string; status: string }[];
    formatOrderDate: (isoDate: string) => string;
    formatEstimatedTime: (isoDate: string) => string;
    calculateRemainingTime: (estimatedDeliveryTime: string) => string;
    handleViewOrderDetails: (orderGroup: CustomerCurrentOrderDTO) => Promise<void>;
    handleTrackOrder: (orderGroup: CustomerCurrentOrderDTO) => Promise<void>;
    handleCancelOrderClick: (orderGroup: CustomerCurrentOrderDTO) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
    activeOrderGroups,
    getOrderSteps,
    formatOrderDate,
    formatEstimatedTime,
    calculateRemainingTime,
    handleViewOrderDetails,
    handleTrackOrder,
    handleCancelOrderClick
}) => {
    const { t } = useTranslation();

    if (activeOrderGroups.length === 0) return null;

    return (
        <Box sx={{ my: 6 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                {t('orderTracking.currentOrders', { count: activeOrderGroups.length })}
            </Typography>

            {activeOrderGroups.map((orderGroup) => (
                <Paper key={orderGroup.orderGroupId} sx={{ borderRadius: 4, mb: 3 }}>
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">
                                    {t('orderTracking.orderFrom', { restaurant: orderGroup.restaurantName })}
                                </Typography>
                                <Typography color="text.secondary">
                                    {t('orderTracking.orderNumber', { id: orderGroup.orderGroupId })}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('orderTracking.placedAt', { time: formatOrderDate(orderGroup.orderedDate) })}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="bold" color="secondary">
                                    {calculateRemainingTime(orderGroup.estimatedDeliveryTime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('orderTracking.estimatedDelivery', { time: formatEstimatedTime(orderGroup.estimatedDeliveryTime) })}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Order Status Progress */}
                        <Box sx={{ my: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', mb: 1 }}>
                                {getOrderSteps(orderGroup.status).map((step, index) => (
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                                        {step.status === 'completed' || step.status === 'active' ? (
                                            <Box sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>
                                                ✓
                                            </Box>
                                        ) : (
                                            <CircleRounded sx={{ color: '#d1d1d1', fontSize: 28 }} />
                                        )}
                                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                            {t(`orderTracking.steps.${step.label.toLowerCase().replace(/\s+/g, '')}`)}
                                        </Typography>
                                    </Box>
                                ))}

                                {/* Progress Bar Background */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 14,
                                    left: 20,
                                    right: 20,
                                    height: 2,
                                    bgcolor: '#d1d1d1',
                                    zIndex: 1
                                }} />

                                {/* Progress Bar Fill */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 14,
                                    left: 20,
                                    width: orderGroup.status.toUpperCase() === "CONFIRMED" ? '10%'
                                        : orderGroup.status.toUpperCase() === "PREPARING" ? '35%'
                                            : orderGroup.status.toUpperCase() === "READY_FOR_PICKUP" ? '55%'
                                                : orderGroup.status.toUpperCase() === "ON_THE_WAY" ? '65%'
                                                    : orderGroup.status.toUpperCase() === "DELIVERED" ? '100%' : '0%',
                                    height: 2,
                                    bgcolor: 'primary.main',
                                    zIndex: 1
                                }} />
                            </Box>
                        </Box>

                        <Stack direction={{ xs: "column", md: "row" }} gap={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2 }} src={orderGroup.img || "/src/assets/restaurant-logo.png"} />
                                <Box>
                                    <Typography sx={{ fontWeight: 500 }}>
                                        {orderGroup.restaurantName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('orderTracking.itemsDistance', {
                                            count: orderGroup.itemCount,
                                            distance: orderGroup.distanceInKm.toFixed(1)
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            <Stack direction="row" gap={2}>
                                {orderGroup.status.toUpperCase() === "ORDERED" &&
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleCancelOrderClick(orderGroup)}
                                        color="secondary"
                                    >
                                        {t('orderTracking.cancelOrder')}
                                    </Button>
                                }

                                <Button
                                    variant="contained"
                                    onClick={() => handleViewOrderDetails(orderGroup)}
                                >
                                    {t('orderTracking.viewDetails')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleTrackOrder(orderGroup)}
                                    disabled={orderGroup.status.toUpperCase() !== "ON_THE_WAY"}
                                >
                                    {t('orderTracking.trackOrder')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

export default OrderTracking;