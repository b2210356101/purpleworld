import {
    Box,
    Typography,
    Divider,
    Grid,
    Switch,
    Stack,
    Paper,
    Avatar,
    Button,
    Snackbar,
    Alert,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material"
import { useEffect, useState } from "react";
import { CourierOrder, Stat } from "../types";
import { deliveredOrder, getCourierOrders, getCourierStats, markOrderAsPickedUp, updateCourierAvailability } from "../utils/api";
import Loading from "../components/Loading";
import { useTranslation } from 'react-i18next';

const CourierDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<Stat[]>([]);
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [currentOrders, setCurrentOrders] = useState<CourierOrder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [openSuccess, setOpenSuccess] = useState<boolean>(false);
    const [openError, setOpenError] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
    const [pendingAvailabilityStatus, setPendingAvailabilityStatus] = useState<boolean>(false);

    // Fetch courier orders and stats 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersData, statsData] = await Promise.all([
                    getCourierOrders(),
                    getCourierStats()
                ]);

                setCurrentOrders(ordersData);
                setIsAvailable(statsData.available);

                const statsArray: Stat[] = [
                    { value: statsData.totalDeliveries, label: t('courier.stats.totalDeliveries'), icon: '📊' },
                    { value: statsData.todayDeliveries, label: t('courier.stats.todayDeliveries'), icon: '📊' },
                    { value: `₺${statsData.totalEarnings.toFixed(2)}`, label: t('courier.stats.totalEarnings'), icon: '📊' },
                ];
                setStats(statsArray);
            } catch (error) {
                console.error(t('courier.error.fetchData'), error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 10000); // 10 seconds
        return () => clearInterval(intervalId);
    }, [t]);

    const handleAvailabilityChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newStatus = event.target.checked;

        if (!newStatus) {
            const hasQueuedOrder = currentOrders.some(order => order.status === "READY_FOR_PICKUP" && !order.mainOrder);

            if (hasQueuedOrder) {
                setPendingAvailabilityStatus(newStatus);
                setOpenConfirmDialog(true);
                return;
            }
        }

        await updateAvailability(newStatus);
    };

    const updateAvailability = async (status: boolean) => {
        setIsAvailable(status);
        try {
            await updateCourierAvailability();
        } catch (error) {
            setIsAvailable(!status);
            console.error(t('courier.error.updateAvailability'), error);
        }
    };

    const handlePickedUp = async (orderGroupId: number) => {
        try {
            await markOrderAsPickedUp(orderGroupId);

            setCurrentOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderGroupId === orderGroupId
                        ? { ...order, status: "ON_THE_WAY", mainOrder: true }
                        : order.mainOrder && order.orderGroupId !== orderGroupId
                            ? { ...order, mainOrder: false }
                            : order
                )
            );

            setSuccessMessage(t('courier.success.pickedUp'));
            setOpenSuccess(true);
        } catch (error) {
            setErrorMessage(t('courier.error.pickedUp'));
            setOpenError(true);
        }
    };

    const handleDelivered = async (orderGroupId: number) => {
        try {
            await deliveredOrder(orderGroupId);

            // Remove the delivered order from the current orders
            setCurrentOrders(prevOrders => {
                // Filter out the delivered order
                const updatedOrders = prevOrders.filter(order => order.orderGroupId !== orderGroupId);

                // Find the first READY_FOR_PICKUP order and set it as mainOrder
                const firstReadyOrder = updatedOrders.find(order => order.status === "READY_FOR_PICKUP");

                if (firstReadyOrder) {
                    return updatedOrders.map(order =>
                        order.orderGroupId === firstReadyOrder.orderGroupId
                            ? { ...order, mainOrder: true }
                            : order
                    );
                }

                return updatedOrders;
            });

            // Refresh the statistics
            const statsData = await getCourierStats();
            setIsAvailable(statsData.available);
            const statsArray: Stat[] = [
                { value: statsData.totalDeliveries, label: t('courier.stats.totalDeliveries'), icon: '📊' },
                { value: statsData.todayDeliveries, label: t('courier.stats.todayDeliveries'), icon: '📊' },
                { value: `₺${statsData.totalEarnings.toFixed(2)}`, label: t('courier.stats.totalEarnings'), icon: '📊' },
            ];
            setStats(statsArray);

            setSuccessMessage(t('courier.success.delivered'));
            setOpenSuccess(true);
        } catch (error) {
            setErrorMessage(t('courier.error.delivered'));
            setOpenError(true);
        }
    };

    const handleConfirmAvailabilityChange = async () => {
        setOpenConfirmDialog(false);
        await updateAvailability(pendingAvailabilityStatus);
    };

    const handleCancelAvailabilityChange = () => {
        setOpenConfirmDialog(false);
    };

    const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSuccess(false);
    };

    const handleCloseError = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenError(false);
    };

    const getActiveOrder = () => {
        return currentOrders.find(order =>
            (order.status === "ON_THE_WAY" || (order.status === "READY_FOR_PICKUP" && order.mainOrder === true))
        );
    };

    const getReadyForPickupOrders = () => {
        return currentOrders.filter(order =>
            order.status === "READY_FOR_PICKUP" && order.mainOrder !== true
        );
    };

    const activeOrder = getActiveOrder();
    const readyForPickupOrders = getReadyForPickupOrders();

    return (
        <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('courier.dashboard.title')}
            </Typography>

            <Grid container spacing={5}>
                <Grid size={{ xs: 12, sm: 8 }}>
                    <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            {t('courier.dashboard.availability')}
                        </Typography>
                        <Switch checked={isAvailable} onChange={handleAvailabilityChange} />
                    </Stack>
                    <Divider sx={{ mb: 3 }} />

                    {activeOrder && (
                        <Paper sx={{ borderRadius: 4, mb: 5 }}>
                            <Box sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h6">
                                            {t('courier.order.number', { id: activeOrder.orderGroupId })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('courier.order.placedAt', { time: new Date(activeOrder.orderedDate).toLocaleString() })}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack direction={{ xs: "column", md: "row" }} gap={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2 }} src="/src/assets/restaurant-logo.png" />
                                        <Box>
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {activeOrder.restaurantName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('courier.order.items', { count: activeOrder.orderItems?.length || 0 })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        component="a"
                                        href={activeOrder.status === "READY_FOR_PICKUP"
                                            ? `https://www.google.com/maps/search/?api=1&query=${activeOrder.restaurantLatitude},${activeOrder.restaurantLongitude}`
                                            : `https://www.google.com/maps/dir/?api=1&origin=${activeOrder.restaurantLatitude},${activeOrder.restaurantLongitude}&destination=${activeOrder.customerLatitude},${activeOrder.customerLongitude}`
                                        }
                                        target="_blank"
                                    >
                                        {activeOrder.status === "READY_FOR_PICKUP"
                                            ? t('courier.actions.restaurantLocation')
                                            : t('courier.actions.navigateToCustomer')
                                        }
                                    </Button>
                                </Stack>

                                <Stack direction={{ xs: "column", md: "row" }} gap={4} sx={{ mt: 2 }}>
                                    {activeOrder.status === "READY_FOR_PICKUP" ? (
                                        <Button fullWidth onClick={() => handlePickedUp(activeOrder.orderGroupId)} variant="contained">
                                            {t('courier.actions.pickUp')}
                                        </Button>
                                    ) : (
                                        <Button fullWidth onClick={() => handleDelivered(activeOrder.orderGroupId)} variant="contained">
                                            {t('courier.actions.delivered')}
                                        </Button>
                                    )}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{ color: 'primary.main', bgcolor: "primary.light" }}
                                        component="a"
                                        disabled={activeOrder.status === "READY_FOR_PICKUP"}
                                        href={`tel:0${activeOrder.customerPhone}`}
                                    >
                                        {t('courier.actions.callCustomer')}
                                    </Button>
                                </Stack>
                            </Box>
                        </Paper>
                    )}

                    {readyForPickupOrders.length > 0 && (
                        <Paper sx={{ borderRadius: 4, mb: 3, bgcolor: 'primary.light' }}>
                            <Stack spacing={2} sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{
                                    color: 'primary.main', fontWeight: 'bold'
                                }}>{t('courier.dashboard.newOrder')}</Typography>

                                {readyForPickupOrders.map(order => (
                                    <Paper key={order.orderGroupId} sx={{ borderRadius: 4 }}>
                                        <Box sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="h6">
                                                        {t('courier.order.number', { id: order.orderGroupId })}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('courier.order.placedAt', { time: new Date(order.orderedDate).toLocaleString() })}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Stack direction={{ xs: "column", md: "row" }} gap={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ mr: 2 }} src="/src/assets/restaurant-logo.png" />
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 500 }}>
                                                            {order.restaurantName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {t('courier.order.items', { count: order.orderItems?.length || 0 })}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                                    <Button
                                                        variant="outlined"
                                                        component="a"
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.restaurantLatitude},${order.restaurantLongitude}`}
                                                        target="_blank"
                                                    >
                                                        {t('courier.actions.openInMaps')}
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    )}

                    {isLoading && <Loading />}

                    {!isLoading && currentOrders.length === 0 && (
                        <Paper sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
                            <Typography variant="h6">{t('courier.dashboard.noOrders')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('courier.dashboard.ordersAppearHere')}
                            </Typography>
                        </Paper>
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        {t('courier.dashboard.statistics')}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6 }}>
                        {stats.map((stat) => (
                            <Paper
                                key={stat.label}
                                sx={{
                                    borderRadius: 3,
                                    p: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    bgcolor: 'primary.light',
                                    width: '100%',
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: 'background.default',
                                        borderRadius: '50%',
                                        width: 60,
                                        height: 60,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    {stat.icon ?? '📊'}
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
                </Grid>
            </Grid>

            {/* Success Notification */}
            <Snackbar
                open={openSuccess}
                autoHideDuration={6000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }} variant="filled">
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Error Notification */}
            <Snackbar
                open={openError}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }} variant="filled">
                    {errorMessage}
                </Alert>
            </Snackbar>

            {/* Confirm Dialog for Availability Change */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCancelAvailabilityChange}
            >
                <DialogTitle>{t('courier.dialog.queuedOrderTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('courier.dialog.queuedOrderDescription')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelAvailabilityChange} color="primary">
                        {t('util.cancel')}
                    </Button>
                    <Button onClick={handleConfirmAvailabilityChange} color="error" autoFocus>
                        {t('util.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourierDashboard;