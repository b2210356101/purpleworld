import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Pagination,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Divider
} from '@mui/material';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    getAllCouriers,
    approveCourier,
    rejectCourier,
    banCourier,
    unbanCourier
} from '../utils/api';
import { CourierResponseForAdmin } from '../types';
import Loading from '../components/Loading';
import { useTranslation } from 'react-i18next';

// Styled component for the page header
const PageHeader = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(3),
}));

// Styled component for info labels
const InfoLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
    minWidth: '120px',
}));

// Main courier management component
const AdminCourierManagementPage: React.FC = () => {
    const { t } = useTranslation();

    // State for couriers data
    const [couriers, setCouriers] = useState<CourierResponseForAdmin[]>([]);
    // State for pagination
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    // State for loading and error
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // State for notification
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info',
    });
    // State for courier details dialog
    const [selectedCourier, setSelectedCourier] = useState<CourierResponseForAdmin | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);

    // Items per page - could be made configurable
    const ITEMS_PER_PAGE = 5;

    // Fetch couriers data from API
    const fetchCouriers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllCouriers();
            setCouriers(data);

            // Calculate total pages based on data length
            setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('admin.courier.fetchError');
            setError(errorMessage);
            console.error('Error fetching couriers:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load couriers on component mount
    useEffect(() => {
        fetchCouriers();
    }, []);

    // Handle page change
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // Get paginated couriers
    const getPaginatedCouriers = () => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return couriers.slice(startIndex, endIndex);
    };

    // Handle ban courier
    const handleBanCourier = async (courierId: number) => {
        try {
            setLoading(true);
            await banCourier(courierId);

            // Update local state
            setCouriers(prevCouriers =>
                prevCouriers.map(courier =>
                    courier.id === courierId
                        ? { ...courier, status: 'BANNED' }
                        : courier
                )
            );

            // Show success notification
            setNotification({
                open: true,
                message: t('admin.courier.banSuccess'),
                severity: 'success',
            });
        } catch (err) {
            // Show error notification
            const errorMessage = err instanceof Error ? err.message : t('admin.courier.banError');
            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error',
            });
            console.error(`Error banning courier with ID ${courierId}:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Handle approve courier
    const handleApproveCourier = async (courierId: number) => {
        try {
            setLoading(true);
            await approveCourier(courierId);

            // Update local state
            setCouriers(prevCouriers =>
                prevCouriers.map(courier =>
                    courier.id === courierId
                        ? { ...courier, status: 'APPROVED' }
                        : courier
                )
            );

            // Show success notification
            setNotification({
                open: true,
                message: t('admin.courier.approveSuccess'),
                severity: 'success',
            });
        } catch (err) {
            // Show error notification
            const errorMessage = err instanceof Error ? err.message : t('admin.courier.approveError');
            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error',
            });
            console.error(`Error approving courier with ID ${courierId}:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Handle reject courier
    const handleRejectCourier = async (courierId: number) => {
        try {
            setLoading(true);
            await rejectCourier(courierId);

            // Update local state
            setCouriers(prevCouriers =>
                prevCouriers.map(courier =>
                    courier.id === courierId
                        ? { ...courier, status: 'REJECTED' }
                        : courier
                )
            );

            // Show success notification
            setNotification({
                open: true,
                message: t('admin.courier.rejectSuccess'),
                severity: 'success',
            });
        } catch (err) {
            // Show error notification
            const errorMessage = err instanceof Error ? err.message : t('admin.courier.rejectError');
            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error',
            });
            console.error(`Error rejecting courier with ID ${courierId}:`, err);
        } finally {
            setLoading(false);
        }
    };
    // Handle unban courier
    const handleUnbanCourier = async (courierId: number) => {
        try {
            setLoading(true);
            await unbanCourier(courierId);

            // Update local state
            setCouriers(prevCouriers =>
                prevCouriers.map(courier =>
                    courier.id === courierId
                        ? { ...courier, status: 'APPROVED' }
                        : courier
                )
            );

            // Show success notification
            setNotification({
                open: true,
                message: t('admin.courier.unbanSuccess'),
                severity: 'success',
            });
        } catch (err) {
            // Show error notification
            const errorMessage = err instanceof Error ? err.message : t('admin.courier.unbanError');
            setNotification({
                open: true,
                message: errorMessage,
                severity: 'error',
            });
            console.error(`Error unbanning courier with ID ${courierId}:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Handle viewing courier details
    const handleViewCourier = (courier: CourierResponseForAdmin) => {
        setSelectedCourier(courier);
        setDetailsDialogOpen(true);
    };

    // Handle closing courier details dialog
    const handleCloseDetailsDialog = () => {
        setDetailsDialogOpen(false);
        setSelectedCourier(null);
    };

    // Close notification
    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Get status chip color
    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'primary.main';
            case 'REJECTED':
                return 'secondary.light';
            case 'BANNED':
                return 'secondary.dark';
            case 'PENDING':
                return 'orange';
            default:
                return 'default';
        }
    };

    // Get status label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return t('admin.status.approved');
            case 'REJECTED':
                return t('admin.status.rejected');
            case 'BANNED':
                return t('admin.status.banned');
            case 'PENDING':
                return t('admin.status.pending');
            default:
                return status.charAt(0) + status.slice(1).toLowerCase();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader variant="h4">{t('menu.courierManagement')}</PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('admin.courier.fullName')}</TableCell>
                            <TableCell>{t('admin.courier.id')}</TableCell>
                            <TableCell>{t('admin.courier.email')}</TableCell>
                            <TableCell>{t('admin.courier.phone')}</TableCell>
                            <TableCell>{t('admin.courier.status')}</TableCell>
                            <TableCell align="right">{t('admin.actions.action')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Loading />
                                </TableCell>
                            </TableRow>
                        ) : couriers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    {t('admin.courier.noCouriers')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            getPaginatedCouriers().map((courier) => (
                                <TableRow key={courier.id}>
                                    <TableCell>{`${courier.firstName} ${courier.lastName}`}</TableCell>
                                    <TableCell>{courier.id}</TableCell>
                                    <TableCell>{courier.email}</TableCell>
                                    <TableCell>{courier.phoneNumber}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(courier.status)}
                                            size="small"
                                            sx={{
                                                borderRadius: '16px',
                                                fontSize: '0.75rem',
                                                minWidth: '80px',
                                                textAlign: 'center',
                                                color: 'white',
                                                bgcolor: getStatusChipColor(courier.status)
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Grid container spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                            {/* When courier is APPROVED, show Ban button */}
                                            {courier.status === 'APPROVED' && (
                                                <Grid size={{ xs: 'auto' }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'secondary.dark' }}
                                                        onClick={() => handleBanCourier(courier.id)}
                                                        disabled={loading}
                                                    >
                                                        {t('admin.actions.ban')}
                                                    </Button>
                                                </Grid>
                                            )}

                                            {/* When courier is PENDING, show Approve and Reject buttons */}
                                            {courier.status === 'PENDING' && (
                                                <>
                                                    <Grid size={{ xs: 'auto' }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'primary.main' }}
                                                            onClick={() => handleApproveCourier(courier.id)}
                                                            disabled={loading}
                                                        >
                                                            {t('admin.actions.approve')}
                                                        </Button>
                                                    </Grid>
                                                    <Grid size={{ xs: 'auto' }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'secondary.light' }}
                                                            onClick={() => handleRejectCourier(courier.id)}
                                                            disabled={loading}
                                                        >
                                                            {t('admin.actions.reject')}
                                                        </Button>
                                                    </Grid>
                                                </>
                                            )}
                                            {/* When courier is REJECTED, show only Approve button */}
                                            {courier.status === 'REJECTED' && (
                                                <>
                                                    <Grid size={{ xs: 'auto' }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'primary.main' }}
                                                            onClick={() => handleApproveCourier(courier.id)}
                                                            disabled={loading}
                                                        >
                                                            {t('admin.actions.approve')}
                                                        </Button>
                                                    </Grid>
                                                </>
                                            )}
                                            {/* When courier is BANNED, show Unban button */}
                                            {courier.status === 'BANNED' && (
                                                <Grid size={{ xs: 'auto' }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'teal' }}
                                                        onClick={() => handleUnbanCourier(courier.id)}
                                                        disabled={loading}
                                                    >
                                                        {t('admin.actions.unban')}
                                                    </Button>
                                                </Grid>
                                            )}

                                            {/* View button for all couriers */}
                                            <Grid size={{ xs: 'auto' }}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '16px',
                                                        textTransform: 'none'
                                                    }}
                                                    onClick={() => handleViewCourier(courier)}
                                                    disabled={loading}
                                                >
                                                    {t('admin.actions.view')}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {!loading && couriers.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                    />
                </Box>
            )}

            {/* Courier details dialog */}
            <Dialog
                open={detailsDialogOpen}
                onClose={handleCloseDetailsDialog}
                maxWidth="sm"
                fullWidth
            >
                {selectedCourier && (
                    <>
                        <DialogTitle>
                            <Typography variant="h6" component="div">
                                {t('admin.courier.detailsTitle')}
                            </Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.id')}:</InfoLabel>
                                    <Typography>{selectedCourier.id}</Typography>
                                </Box>
                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.firstName')}:</InfoLabel>
                                    <Typography>{selectedCourier.firstName}</Typography>
                                </Box>
                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.lastName')}:</InfoLabel>
                                    <Typography>{selectedCourier.lastName}</Typography>
                                </Box>
                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.email')}:</InfoLabel>
                                    <Typography>{selectedCourier.email}</Typography>
                                </Box>
                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.phone')}:</InfoLabel>
                                    <Typography>{selectedCourier.phoneNumber}</Typography>
                                </Box>
                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.status')}:</InfoLabel>
                                    <Chip
                                        label={getStatusLabel(selectedCourier.status)}
                                        size="small"
                                        sx={{
                                            borderRadius: '16px',
                                            fontSize: '0.75rem',
                                            minWidth: '80px',
                                            textAlign: 'center',
                                            color: 'white',
                                            bgcolor: getStatusChipColor(selectedCourier.status) as any
                                        }}
                                    />
                                </Box>
                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoLabel>{t('admin.courier.ssn')}:</InfoLabel>
                                    <Typography>{selectedCourier.ssn}</Typography>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetailsDialog} sx={{ color: 'secondary.main' }}>
                                {t('util.cancel')}
                            </Button>

                            {/* Conditional action buttons based on status */}
                            {selectedCourier.status === 'APPROVED' && (
                                <Button
                                    onClick={() => {
                                        handleBanCourier(selectedCourier.id);
                                        handleCloseDetailsDialog();
                                    }}
                                    sx={{ bgcolor: 'secondary.dark' }}
                                    variant="contained"
                                >
                                    {t('admin.actions.banCourier')}
                                </Button>
                            )}
                            {selectedCourier.status === 'REJECTED' && (
                                <Button
                                    onClick={() => {
                                        handleApproveCourier(selectedCourier.id);
                                        handleCloseDetailsDialog();
                                    }}
                                    sx={{ bgcolor: 'green' }}
                                    variant="contained"
                                >
                                    {t('admin.actions.approve')}
                                </Button>
                            )}

                            {selectedCourier.status === 'PENDING' && (
                                <>
                                    <Button
                                        onClick={() => {
                                            handleRejectCourier(selectedCourier.id);
                                            handleCloseDetailsDialog();
                                        }}
                                        sx={{ bgcolor: 'secondary.light' }}
                                        variant="contained"
                                    >
                                        {t('admin.actions.reject')}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleApproveCourier(selectedCourier.id);
                                            handleCloseDetailsDialog();
                                        }}
                                        sx={{ bgcolor: 'primary' }}
                                        variant="contained"
                                    >
                                        {t('admin.actions.approve')}
                                    </Button>
                                </>
                            )}
                            {/* Add Unban button for BANNED couriers */}
                            {selectedCourier.status === 'BANNED' && (
                                <Button
                                    onClick={() => {
                                        handleUnbanCourier(selectedCourier.id);
                                        handleCloseDetailsDialog();
                                    }}
                                    sx={{ bgcolor: 'teal' }}
                                    variant="contained"
                                >
                                    {t('admin.actions.unbanCourier')}
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Notification snackbar */}
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
        </Box>
    );
};

export default AdminCourierManagementPage;