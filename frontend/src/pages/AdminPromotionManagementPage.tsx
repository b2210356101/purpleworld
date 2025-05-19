import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  FormControl, 
  FormLabel,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAllCoupons, createCoupon, deleteCoupon, updateCoupon } from '../utils/api';
import { CouponRequest, CouponResponse } from '../types';
import Loading from '../components/Loading';

const PageHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const AdminPromotionManagementPage = () => {
    
  // State for form values
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // State for existing coupons
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  // State for update modal
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | null>(null);
  const [updateName, setUpdateName] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateDiscountAmount, setUpdateDiscountAmount] = useState('');
  const [updateMinOrderAmount, setUpdateMinOrderAmount] = useState('');
  const [updateExpiryDate, setUpdateExpiryDate] = useState('');

  // Fetch existing coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Function to fetch existing coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err?.response?.data?.message || 'Failed to load coupons');
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new coupon
  const handleCreateCoupon = async () => {
    // Validate inputs
    if (!name || !discountAmount || !minOrderAmount || !expiryDate) {
      setError('Name, discount amount, minimum order amount, and expiry date are required');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      const couponRequest: CouponRequest = {
        name,
        description,
        discountAmount: parseInt(discountAmount),
        minOrderAmount: parseInt(minOrderAmount),
        expiryDate
      };

      await createCoupon(couponRequest);
      
      // Reset form fields
      setName('');
      setDescription('');
      setDiscountAmount('');
      setMinOrderAmount('');
      setExpiryDate('');
      
      setSuccess('Coupon created successfully');
      setSnackbarType('success');
      setOpenSnackbar(true);
      
      // Refresh coupons list
      fetchCoupons();
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      setError(err?.response?.data?.message || 'Failed to create coupon');
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a coupon
  const handleDeleteCoupon = async (id: number) => {
    try {
      setLoading(true);
      await deleteCoupon(id);
      
      setSuccess('Coupon deleted successfully');
      setSnackbarType('success');
      setOpenSnackbar(true);
      
      // Update local state
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    } catch (err: any) {
      console.error('Error deleting coupon:', err);
      setError(err?.response?.data?.message || 'Failed to delete coupon');
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to open update dialog and set selected coupon
  const handleOpenUpdateDialog = (coupon: CouponResponse) => {
    setSelectedCoupon(coupon);
    setUpdateName(coupon.code);
    setUpdateDescription(coupon.description || '');
    setUpdateDiscountAmount(coupon.discountPercent.toString());
    setUpdateMinOrderAmount(coupon.minOrderPrice.toString());
    setUpdateExpiryDate(coupon.expiryDate ? 
      new Date(coupon.expiryDate).toISOString().split('T')[0] : '');
    setOpenUpdateDialog(true);
  };

  // Function to close update dialog
  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setSelectedCoupon(null);
  };

  // Function to update a coupon
  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;
    
    // Validate inputs
    if (!updateName || !updateDiscountAmount || !updateMinOrderAmount || !updateExpiryDate) {
      setError('Name, discount amount, minimum order amount, and expiry date are required');
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      const couponRequest: CouponRequest = {
        name: updateName,
        description: updateDescription,
        discountAmount: parseInt(updateDiscountAmount),
        minOrderAmount: parseInt(updateMinOrderAmount),
        expiryDate: updateExpiryDate
      };

      await updateCoupon(selectedCoupon.id, couponRequest);
      
      setSuccess('Coupon updated successfully');
      setSnackbarType('success');
      setOpenSnackbar(true);
      
      // Close the dialog
      handleCloseUpdateDialog();
      
      // Refresh coupons list
      fetchCoupons();
    } catch (err: any) {
      console.error('Error updating coupon:', err);
      setError(err?.response?.data?.message || 'Failed to update coupon');
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
    // Clear messages after closing snackbar
    if (snackbarType === 'error') {
      setError('');
    } else {
      setSuccess('');
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No expiry';
    
    // Simple date formatting without using external libraries
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ p:3 }}>
      <PageHeader>
        Promotion Codes
      </PageHeader>
      
      {/* Create Coupon Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create Promotion Code
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {/* First row - Code and Description */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            mb: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <FormLabel>Coupon Code</FormLabel>
                <TextField
                  fullWidth
                  placeholder="e.g., SUMMER2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <FormLabel>Description</FormLabel>
                <TextField
                  fullWidth
                  placeholder="e.g., Summer campaign discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </FormControl>
            </Box>
          </Box>

          {/* Second row - Discount and Min Order */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            mb: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <FormLabel>Discount Amount</FormLabel>
                <TextField
                  fullWidth
                  placeholder={"e.g., 10"}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <FormLabel>Minimum Order Amount</FormLabel>
                <TextField
                  fullWidth
                  placeholder="e.g., 150"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                />
              </FormControl>
            </Box>
          </Box>

         
          <FormControl fullWidth>
            <FormLabel>Expiry Date</FormLabel>
            <TextField
              fullWidth
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              variant="outlined"
              size="small"
              // Set the min attribute to today's date to prevent selecting past dates
              inputProps={{
                min: new Date().toISOString().split('T')[0]
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateCoupon}
            disabled={loading}
            sx={{ borderRadius: 2, px: 4 }}
          >
            {loading ? <CircularProgress sx={{color: 'white'}} size={24} /> : "Create Promotion"}
          </Button>
        </Box>
      </Paper>
      
      {/* Coupons List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Promotions
        </Typography>
        
        {loading && !coupons.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Loading />
          </Box>
        ) : (
          <List>
            {coupons.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No promotions found
              </Typography>
            ) : (
              coupons.map((coupon) => (
                <ListItem
                  key={coupon.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex' }}>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleOpenUpdateDialog(coupon)}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'primary.light',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{coupon.code}</Typography>
                        {!coupon.isActive && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              backgroundColor: 'error.light', 
                              color: 'error.contrastText',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1
                            }}
                          >
                            Inactive
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {coupon.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${coupon.discountPercent}%`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {`Min Order: ${coupon.minOrderPrice}₺`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {`Expires: ${formatDate(coupon.expiryDate)}`}
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </Paper>

      {/* Update Coupon Dialog */}
      <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Update Promotion Code</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* First row - Code and Description */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              mb: 3 
            }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <FormLabel>Coupon Code</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g., SUMMER2025"
                    value={updateName}
                    onChange={(e) => setUpdateName(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <FormLabel>Description</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g., Summer campaign discount"
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Second row - Discount and Min Order */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              mb: 3 
            }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <FormLabel>Discount Amount</FormLabel>
                  <TextField
                    fullWidth
                    placeholder={"e.g., 10"}
                    value={updateDiscountAmount}
                    onChange={(e) => setUpdateDiscountAmount(e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <FormLabel>Minimum Order Amount</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g., 150"
                    value={updateMinOrderAmount}
                    onChange={(e) => setUpdateMinOrderAmount(e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    }}
                  />
                </FormControl>
              </Box>
            </Box>

            <FormControl fullWidth>
              <FormLabel>Expiry Date</FormLabel>
              <TextField
                fullWidth
                type="date"
                value={updateExpiryDate}
                onChange={(e) => setUpdateExpiryDate(e.target.value)}
                variant="outlined"
                size="small"
                // Set the min attribute to today's date to prevent selecting past dates
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseUpdateDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleUpdateCoupon} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Update Promotion"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarType} 
          sx={{ width: '100%' }}
        >
          {snackbarType === 'error' ? error : success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPromotionManagementPage;