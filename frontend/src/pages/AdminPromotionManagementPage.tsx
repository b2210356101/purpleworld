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
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PercentIcon from '@mui/icons-material/Percent';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { getAllCoupons, createCoupon, deleteCoupon, updateCoupon } from '../utils/api';
import { CouponRequest, CouponResponse } from '../types';
import Loading from '../components/Loading';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PageHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const AdminPromotionManagementPage = () => {
  const { t } = useTranslation();
    
  // State for form values
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isPercent, setIsPercent] = useState(true); // Default to percentage discount
  
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
  const [updateCode, setUpdateCode] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateDiscountAmount, setUpdateDiscountAmount] = useState('');
  const [updateMinOrderAmount, setUpdateMinOrderAmount] = useState('');
  const [updateExpiryDate, setUpdateExpiryDate] = useState('');
  const [updateIsPercent, setUpdateIsPercent] = useState(true);

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
      setError(err?.response?.data?.message || t('promotions.error.loadFailed'));
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: boolean | null
  ) => {
    if (newType !== null) {
      setIsPercent(newType);
    }
  };

  const handleUpdateDiscountTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: boolean | null
  ) => {
    if (newType !== null) {
      setUpdateIsPercent(newType);
    }
  };

  // Function to create a new coupon
  const handleCreateCoupon = async () => {
    // Validate inputs
    if (!code || !discountAmount || !minOrderAmount || !expiryDate) {
      setError(t('promotions.error.requiredFields'));
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      const couponRequest: CouponRequest = {
        code,
        description,
        discountAmount: parseInt(discountAmount),
        minOrderPrice: parseInt(minOrderAmount),
        expiryDate,
        isPercent 
      };

      await createCoupon(couponRequest);
      
      // Reset form fields
      setCode('');
      setDescription('');
      setDiscountAmount('');
      setMinOrderAmount('');
      setExpiryDate('');
      
      setSuccess(t('promotions.success.created'));
      setSnackbarType('success');
      setOpenSnackbar(true);
      
      // Refresh coupons list
      fetchCoupons();
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      setError(err?.response?.data?.message || t('promotions.error.createFailed'));
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
      
      setSuccess(t('promotions.success.deleted'));
      setSnackbarType('success');
      setOpenSnackbar(true);
      
      // Update local state
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    } catch (err: any) {
      console.error('Error deleting coupon:', err);
      setError(err?.response?.data?.message || t('promotions.error.deleteFailed'));
      setSnackbarType('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to open update dialog and set selected coupon
  const handleOpenUpdateDialog = (coupon: CouponResponse) => {
    setSelectedCoupon(coupon);
    setUpdateCode(coupon.code);
    setUpdateDescription(coupon.description || '');
    setUpdateDiscountAmount(coupon.discountAmount.toString());
    setUpdateMinOrderAmount(coupon.minOrderPrice.toString());
    setUpdateExpiryDate(coupon.expiryDate ? 
      new Date(coupon.expiryDate).toISOString().split('T')[0] : '');
    setUpdateIsPercent(coupon.isPercent !== undefined ? coupon.isPercent : true);
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
    if (!updateCode || !updateDiscountAmount || !updateMinOrderAmount || !updateExpiryDate) {
      setError(t('promotions.error.requiredFields'));
      setSnackbarType('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      const couponRequest: CouponRequest = {
        code: updateCode,
        description: updateDescription,
        discountAmount: parseInt(updateDiscountAmount),
        minOrderPrice: parseInt(updateMinOrderAmount),
        expiryDate: updateExpiryDate,
        isPercent: updateIsPercent // Include the discount type flag
      };

      await updateCoupon(selectedCoupon.id, couponRequest);
      
      setSuccess(t('promotions.success.updated'));
      setSnackbarType('success');
      setOpenSnackbar(true);
      
      // Close the dialog
      handleCloseUpdateDialog();
      
      // Refresh coupons list
      fetchCoupons();
    } catch (err: any) {
      console.error('Error updating coupon:', err);
      setError(err?.response?.data?.message || t('promotions.error.updateFailed'));
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
    if (!dateString) return t('promotions.noExpiry', 'No expiry');
    
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
        {t('promotions.title')}
      </PageHeader>
      
      {/* Create Coupon Form */}
      <Paper sx={{ borderRadius: 4, p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('promotions.create')}
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
                <TextField
                  fullWidth
                  label={t('promotions.couponCode')}
                  placeholder="SUMMER2025"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  variant="outlined"
                />
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  label={t('promotions.description')}
                  placeholder="Summer campaign discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                />
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            mb: 3 
          }}>
            <Box sx={{ flex: 1, display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, gap: 2,  }}>
                <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth>
                        <TextField
                        fullWidth
                        label={t('promotions.discountAmount')}
                        placeholder={isPercent ? "10" : "50"}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        variant="outlined"
                        size="small"
                        type="number"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">
                            {isPercent ? '%' : '₺'}
                            </InputAdornment>
                        }}
                        />
                    </FormControl>
                    </Box>

                    <Box sx={{ flex: 1.5 }}>
                    <FormControl fullWidth>
                        <ToggleButtonGroup
                        value={isPercent}
                        exclusive
                        onChange={handleDiscountTypeChange}
                        aria-label="discount type"
                        size="small"
                        >
                        <ToggleButton value={true} aria-label="percentage discount" fullWidth>
                            <Tooltip title={t('promotions.percentageDiscount')}>
                            <PercentIcon sx={{ mr: 1 }} />
                            </Tooltip>
                            {t('promotions.percentage')}
                        </ToggleButton>
                        <ToggleButton value={false} aria-label="fixed amount discount" fullWidth>
                            <Tooltip title={t('promotions.fixedAmountDiscount')}>
                            <LocalAtmIcon sx={{ mr: 1 }} />
                            </Tooltip>
                            {t('promotions.fixedAmount')}
                        </ToggleButton>
                        </ToggleButtonGroup>
                    </FormControl>
                </Box>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  label={t('promotions.minOrderAmount')}
                  placeholder="150"
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
            <TextField
              fullWidth
              label={t('promotions.expiryDate')}
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
            sx={{ px: 4 }}
          >
            {loading ? <CircularProgress sx={{color: 'white'}} size={24} /> : t('promotions.createPromotion')}
          </Button>
        </Box>
      </Paper>
      
      {/* Coupons List */}
      <Paper sx={{ borderRadius: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('promotions.list')}
        </Typography>
        
        {loading && !coupons.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Loading />
          </Box>
        ) : (
          <List>
            {coupons.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                {t('promotions.noPromotions')}
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
                    borderRadius: 3,
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
                            {t('promotions.inactive')}
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
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            {coupon.isPercent !== false 
                              ? <><PercentIcon fontSize="small" sx={{ mr: 0.5 }} /> {`${coupon.discountAmount}%`}</>
                              : <><LocalAtmIcon fontSize="small" sx={{ mr: 0.5 }} /> {`${coupon.discountAmount}₺`}</>
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {`${t('promotions.minOrder')}: ${coupon.minOrderPrice}₺`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {`${t('promotions.expires')}: ${formatDate(coupon.expiryDate)}`}
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
        <DialogTitle>{t('promotions.updatePromotion')}</DialogTitle>
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
                  <TextField
                    fullWidth
                    label={t('promotions.couponCode')}
                    placeholder="SUMMER2025"
                    value={updateCode}
                    onChange={(e) => setUpdateCode(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <TextField
                    fullWidth
                    label={t('promotions.description')}
                    placeholder="Summer campaign discount"
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Discount Type Toggle for Update */}
            <Box sx={{ mb: 3 }}>
                <ToggleButtonGroup
                    value={updateIsPercent}
                    exclusive
                    onChange={handleUpdateDiscountTypeChange}
                    aria-label="discount type"
                    size="small"
                    fullWidth
                >
                    <ToggleButton value={true} aria-label="percentage discount" fullWidth>
                    <Tooltip title={t('promotions.percentageDiscount')}>
                        <PercentIcon sx={{ mr: 1 }} />
                    </Tooltip>
                    {t('promotions.percentage')}
                    </ToggleButton>
                    <ToggleButton value={false} aria-label="fixed amount discount" fullWidth>
                    <Tooltip title={t('promotions.fixedAmountDiscount')}>
                        <LocalAtmIcon sx={{ mr: 1 }} />
                    </Tooltip>
                    {t('promotions.fixedAmount')}
                    </ToggleButton>
                </ToggleButtonGroup>
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
                  <TextField
                    fullWidth
                    label={t('promotions.discountAmount')}
                    placeholder={updateIsPercent ? "10" : "50"}
                    value={updateDiscountAmount}
                    onChange={(e) => setUpdateDiscountAmount(e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">
                        {updateIsPercent ? '%' : '₺'}
                      </InputAdornment>
                    }}
                  />
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <TextField
                    fullWidth
                    label={t('promotions.minOrderAmount')}
                    placeholder="150"
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
              <TextField
                fullWidth
                label={t('promotions.expiryDate')}
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
          <Button onClick={handleCloseUpdateDialog} color="inherit">
            {t('promotions.cancel')}
          </Button>
          <Button 
            onClick={handleUpdateCoupon} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('promotions.updatePromotion')}
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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarType === 'error' ? error : success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPromotionManagementPage;