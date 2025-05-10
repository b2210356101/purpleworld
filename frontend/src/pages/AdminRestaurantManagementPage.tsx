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
  getAllRestaurants,
  approveRestaurant,
  rejectRestaurant,
  banRestaurant,
  unbanRestaurant
} from '../utils/api';
import { RestaurantResponseForAdmin } from '../types';
import Loading from '../components/Loading';

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

// Main restaurant management component
const AdminRestaurantManagementPage: React.FC = () => {
  // State for restaurants data
  const [restaurants, setRestaurants] = useState<RestaurantResponseForAdmin[]>([]);
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
  // State for restaurant details dialog
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantResponseForAdmin | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);

  // Items per page - could be made configurable
  const ITEMS_PER_PAGE = 5;

  // Fetch restaurants data from API
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRestaurants();
      setRestaurants(data);

      // Calculate total pages based on data length
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
      setError(errorMessage);
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Get paginated restaurants
  const getPaginatedRestaurants = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return restaurants.slice(startIndex, endIndex);
  };

  // Handle ban restaurant
  const handleBanRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      await banRestaurant(restaurantId);

      // Update local state
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, status: 'BANNED' }
            : restaurant
        )
      );

      // Show success notification
      setNotification({
        open: true,
        message: 'Restaurant banned successfully',
        severity: 'success',
      });
    } catch (err) {
      // Show error notification
      const errorMessage = err instanceof Error ? err.message : 'Failed to ban restaurant';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      console.error(`Error banning restaurant with ID ${restaurantId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handle unban restaurant
  const handleUnbanRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      await unbanRestaurant(restaurantId);

      // Update local state
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, status: 'APPROVED' }
            : restaurant
        )
      );

      // Show success notification
      setNotification({
        open: true,
        message: 'Restaurant unbanned successfully',
        severity: 'success',
      });
    } catch (err) {
      // Show error notification
      const errorMessage = err instanceof Error ? err.message : 'Failed to unban restaurant';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      console.error(`Error unbanning restaurant with ID ${restaurantId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve restaurant
  const handleApproveRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      await approveRestaurant(restaurantId);

      // Update local state
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, status: 'APPROVED' }
            : restaurant
        )
      );

      // Show success notification
      setNotification({
        open: true,
        message: 'Restaurant approved successfully',
        severity: 'success',
      });
    } catch (err) {
      // Show error notification
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve restaurant';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      console.error(`Error approving restaurant with ID ${restaurantId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject restaurant
  const handleRejectRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      await rejectRestaurant(restaurantId);

      // Update local state
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, status: 'REJECTED' }
            : restaurant
        )
      );

      // Show success notification
      setNotification({
        open: true,
        message: 'Restaurant rejected successfully',
        severity: 'success',
      });
    } catch (err) {
      // Show error notification
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject restaurant';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      console.error(`Error rejecting restaurant with ID ${restaurantId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing restaurant details
  const handleViewRestaurant = (restaurant: RestaurantResponseForAdmin) => {
    setSelectedRestaurant(restaurant);
    setDetailsDialogOpen(true);
  };

  // Handle closing restaurant details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedRestaurant(null);
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
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'BANNED':
        return 'Banned';
      case 'PENDING':
        return 'Pending';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader variant="h4">Restaurant Management</PageHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Restaurant Name</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Loading />
                </TableCell>
              </TableRow>
            ) : restaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No restaurants found
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedRestaurants().map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>{restaurant.restaurantName}</TableCell>
                  <TableCell>{restaurant.id}</TableCell>
                  <TableCell>{restaurant.email}</TableCell>
                  <TableCell>{restaurant.phoneNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(restaurant.status)}
                      size="small"
                      sx={{
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        minWidth: '80px',
                        textAlign: 'center',
                        color: 'white',
                        bgcolor: getStatusChipColor(restaurant.status)
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Grid container spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      {/* When restaurant is ACTIVE (approved), show Ban button */}
                      {restaurant.status === 'APPROVED' && (
                        <Grid size={{ xs: 'auto' }}>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'secondary.dark' }}
                            onClick={() => handleBanRestaurant(restaurant.id)}
                            disabled={loading}
                          >
                            Ban
                          </Button>
                        </Grid>
                      )}

                      {/* When restaurant is INACTIVE (rejected), show Approve button */}
                      {restaurant.status === 'REJECTED' && (
                        <Grid size={{ xs: 'auto' }}>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'primary.main' }}
                            onClick={() => handleApproveRestaurant(restaurant.id)}
                            disabled={loading}
                          >
                            Approve
                          </Button>
                        </Grid>
                      )}

                      {/* When restaurant is BANNED, show Unban button */}
                      {restaurant.status === 'BANNED' && (
                        <Grid size={{ xs: 'auto' }}>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'teal' }}
                            onClick={() => handleUnbanRestaurant(restaurant.id)}
                            disabled={loading}
                          >
                            Unban
                          </Button>
                        </Grid>
                      )}

                      {/* When restaurant is PENDING, show Approve and Reject buttons */}
                      {restaurant.status === 'PENDING' && (
                        <>
                          <Grid size={{ xs: 'auto' }}>
                            <Button
                              variant="contained"
                              size="small"
                              sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'primary' }}
                              onClick={() => handleApproveRestaurant(restaurant.id)}
                              disabled={loading}
                            >
                              Approve
                            </Button>
                          </Grid>
                          <Grid size={{ xs: 'auto' }}>
                            <Button
                              variant="contained"
                              size="small"
                              sx={{ borderRadius: '16px', textTransform: 'none', mr: 1, bgcolor: 'secondary.light' }}
                              onClick={() => handleRejectRestaurant(restaurant.id)}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </Grid>
                        </>
                      )}

                      {/* View button for all restaurants */}
                      <Grid size={{ xs: 'auto' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{
                            borderRadius: '16px',
                            textTransform: 'none'
                          }}
                          onClick={() => handleViewRestaurant(restaurant)}
                          disabled={loading}
                        >
                          View
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

      {!loading && restaurants.length > 0 && (
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

      {/* Restaurant details dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedRestaurant && (
          <>
            <DialogTitle>
              <Typography variant="h6" component="div">
                Restaurant Details
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>ID:</InfoLabel>
                  <Typography>{selectedRestaurant.id}</Typography>
                </Box>
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>Name:</InfoLabel>
                  <Typography>{selectedRestaurant.restaurantName}</Typography>
                </Box>
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>Email:</InfoLabel>
                  <Typography>{selectedRestaurant.email}</Typography>
                </Box>
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>Phone:</InfoLabel>
                  <Typography>{selectedRestaurant.phoneNumber}</Typography>
                </Box>
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>Status:</InfoLabel>
                  <Chip
                    label={getStatusLabel(selectedRestaurant.status)}
                    size="small"
                    sx={{
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      minWidth: '80px',
                      textAlign: 'center',
                      color: 'white',
                      bgcolor: getStatusChipColor(selectedRestaurant.status) as any
                    }}
                  />
                </Box>
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>Manager:</InfoLabel>
                  <Typography>
                    {selectedRestaurant.manager_Name} {selectedRestaurant.manager_Last_Name}
                  </Typography>
                </Box>
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoLabel>Tax ID:</InfoLabel>
                  <Typography>{selectedRestaurant.tax_Id}</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog} sx={{ color: 'secondary.main' }}>
                Close
              </Button>

              {/* Conditional action buttons based on status */}
              {selectedRestaurant.status === 'APPROVED' && (
                <Button
                  onClick={() => {
                    handleBanRestaurant(selectedRestaurant.id);
                    handleCloseDetailsDialog();
                  }}
                  sx={{ bgcolor: 'secondary.dark' }}
                  variant="contained"
                >
                  Ban Restaurant
                </Button>
              )}

              {/* Add Approve button for INACTIVE (rejected) restaurants */}
              {selectedRestaurant.status === 'REJECTED' && (
                <Button
                  onClick={() => {
                    handleApproveRestaurant(selectedRestaurant.id);
                    handleCloseDetailsDialog();
                  }}
                  sx={{ bgcolor: 'primary.main' }}
                  variant="contained"
                >
                  Approve Restaurant
                </Button>
              )}

              {/* Add Unban button for BANNED restaurants */}
              {selectedRestaurant.status === 'BANNED' && (
                <Button
                  onClick={() => {
                    handleUnbanRestaurant(selectedRestaurant.id);
                    handleCloseDetailsDialog();
                  }}
                  sx={{ bgcolor: 'teal' }}
                  variant="contained"
                >
                  Unban Restaurant
                </Button>
              )}

              {selectedRestaurant.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => {
                      handleRejectRestaurant(selectedRestaurant.id);
                      handleCloseDetailsDialog();
                    }}
                    sx={{ bgcolor: 'secondary.light' }}
                    variant="contained"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleApproveRestaurant(selectedRestaurant.id);
                      handleCloseDetailsDialog();
                    }}
                    sx={{ bgcolor: 'primary' }}
                    variant="contained"
                  >
                    Approve
                  </Button>
                </>
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRestaurantManagementPage;