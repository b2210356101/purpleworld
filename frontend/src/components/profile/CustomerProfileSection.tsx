import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    Avatar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useAddress } from '../../hooks/useAddress';
import AddAddressModal from '../address/AddAddressModal';

import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    setCurrentAddress,
} from '../../utils/api';
import { updateUserInfo } from '../../store/slices/authSlice';
import Loading from '../Loading';

interface CustomerProfileSectionProps {
    updateSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({ updateSnackbar }) => {
    const { t } = useTranslation();
    const { userInfo } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const address = useAddress();
    const [phoneError, setPhoneError] = useState(false);
    const [phoneErrorMsg, setPhoneErrorMsg] = useState('');

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profileImg: userInfo?.profileImage || ''
    });
    
    const [profileImgFile, setProfileImgFile] = useState<File | null>(null);
    const [profileImgPreview, setProfileImgPreview] = useState<string | undefined>(
        userInfo?.profileImage
    );

    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const response = await getUserProfile();

                setProfileData({
                    firstName: response.firstName || '',
                    lastName: response.lastName || '',
                    email: response.email || '',
                    phoneNumber: response.phoneNumber || '',
                    profileImg: response.profileImg || ''
                });

                setProfileImgPreview(response.profileImg);

                await address.fetchAddresses();
            } catch (error) {
                if (userInfo) {
                    const [firstName, lastName] = (userInfo.username || '').split(' ');
                    setProfileData({
                        firstName: firstName || '',
                        lastName: lastName || '',
                        email: localStorage.getItem('email') || '',
                        phoneNumber: localStorage.getItem('phoneNumber') || '',
                        profileImg: userInfo.profileImage || ''
                    });

                    setProfileImgPreview(userInfo.profileImage);
                }

                updateSnackbar(t('profile.error.fetch'), 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userInfo, address.fetchAddresses, t, updateSnackbar]);

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Handle profile image change
    const handleProfileImgChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSizeInBytes = 1 * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                updateSnackbar(t('profile.max'), "error");
                e.target.value = "";
                return;
            }

            setProfileImgFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImgPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [updateSnackbar]);

    const handleEditToggle = useCallback(async () => {
        if (editMode) {
            // Save changes
            try {
                let profileImgData = profileData.profileImg;
                if (profileImgFile) {
                    const reader = new FileReader();
                    await new Promise((resolve, reject) => {
                        reader.onload = resolve;
                        reader.onerror = reject;
                        reader.readAsDataURL(profileImgFile);
                    });
                    profileImgData = reader.result as string;
                }

                if (!/^\d{10}$/.test(profileData.phoneNumber)) {
                    setPhoneError(true);
                    setPhoneErrorMsg(t('register.customer.phoneRequired') || 'Phone number must be 10 digits.');
                    return;
                }

                const dataToSend = {
                    phoneNumber: profileData.phoneNumber,
                    profileImg: profileImgData,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName
                };

                const response = await updateUserProfile(dataToSend);

                // Update Redux state
                dispatch(updateUserInfo({
                    username: `${profileData.firstName}`,
                    profileImage: response.profileImg || profileImgPreview
                }));

                updateSnackbar(t('profile.update.success'), 'success');
            } catch (error) {
                console.error('Error updating profile:', error);
                updateSnackbar(t('profile.update.error'), 'error');
                return;
            }
        }

        setEditMode(!editMode);
    }, [editMode, profileData, profileImgFile, profileImgPreview, dispatch, t, updateSnackbar]);

    // Handle password change
    const handlePasswordChange = useCallback(async () => {
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            updateSnackbar(t('profile.password.mismatch'), 'error');
            return;
        }

        const passwordRegex = 
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordData.confirmPassword || !passwordRegex.test(passwordData.confirmPassword)) {
            updateSnackbar(t('register.validation.passwordRequirements'), 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            updateSnackbar(t('profile.password.tooShort'), 'error');
            return;
        }

        try {
            await changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            updateSnackbar(t('profile.password.success'), 'success');

            setPasswordDialogOpen(false);
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            updateSnackbar(t('profile.password.error'), 'error');
        }
    }, [passwordData, t, updateSnackbar]);

    // Handle address additions and edits
    const handleAddAddress = useCallback(() => {
        address.setAddressToEdit(null);
        address.setIsNewAddressDialogOpen(true);
    }, [address]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loading />
            </Box>
        );
    }

    return (
        <>
            {/* Profile Information Section */}
            <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
                mb: 4,
            }}>
                {/* Profile Header */}
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={profileImgPreview}
                                alt={userInfo?.username || 'User'}
                                sx={{
                                    width: 96,
                                    height: 96,
                                    border: '4px solid white',
                                }}
                            />
                            {editMode && (
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark'
                                        },
                                        width: 32,
                                        height: 32
                                    }}
                                    component="label"
                                >
                                    <input
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        onChange={handleProfileImgChange}
                                    />
                                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            )}
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {userInfo?.username || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {profileData.email}
                            </Typography>
                            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                                {t('role.customer')}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant={editMode ? "contained" : "outlined"}
                        color={editMode ? "primary" : "inherit"}
                        onClick={handleEditToggle}
                        startIcon={editMode ? null : <EditIcon />}
                    >
                        {editMode ? t('profile.save') : t('profile.edit')}
                    </Button>
                </Box>

                <Divider />

                {/* Profile Form */}
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.firstName')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                />
                            ) : (
                                <Typography variant="body1">{profileData.firstName}</Typography>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.lastName')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                />
                            ) : (
                                <Typography variant="body1">{profileData.lastName}</Typography>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.email')}
                            </Typography>
                            <Typography variant="body1">{profileData.email}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.phoneNumber')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    name="phoneNumber"
                                    value={profileData.phoneNumber}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    error={phoneError}
                                    helperText={phoneError ? phoneErrorMsg : ''}
                                />
                            ) : (
                                <Typography variant="body1">{profileData.phoneNumber}</Typography>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setPasswordDialogOpen(true)}
                                >
                                    {t('profile.changePassword')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Addresses Section */}
            <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
            }}>
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" fontWeight="bold">
                        {t('profile.addresses')}
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleAddAddress}
                    >
                        {t('address.add')}
                    </Button>
                </Box>

                <Divider />

                <Box sx={{ p: 3 }}>
                    {address.addresses.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            {t('address.noAddresses')}
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {address.addresses.map((addr) => (
                                <Grid size={{ xs: 12, md: 6 }} key={addr.addressId}>
                                    <Paper elevation={1} sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        borderLeft: addr.addressId === address.selectedAddress ?
                                            '4px solid #845EC2' : 'none',
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 1
                                        }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {addr.name || t('address.unnamed')}
                                            </Typography>
                                            <Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => address.handleEditAddress(addr)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => address.handleDeleteAddress(addr.addressId)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                                            {addr.fullAddress}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('address.buildingDetails', {
                                                building: addr.buildingNumber,
                                                floor: addr.floor,
                                                apartment: addr.apartmentNumber
                                            })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {addr.phoneNumber}
                                        </Typography>

                                        {addr.deliveryNote && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 1,
                                                    p: 1,
                                                    bgcolor: 'rgba(0,0,0,0.03)',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <strong>{t('address.note')}:</strong> {addr.deliveryNote}
                                            </Typography>
                                        )}

                                        {addr.addressId !== address.selectedAddress && (
                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={async () => {
                                                        try {
                                                            await setCurrentAddress(addr.addressId);

                                                            // Show success message
                                                            updateSnackbar(t('address.defaultSet'), 'success');

                                                            // Refresh addresses to update UI
                                                            await address.fetchAddresses();
                                                        } catch (error) {
                                                            console.error('Error setting default address:', error);
                                                            updateSnackbar(t('address.errorSettingDefault'), 'error');
                                                        }
                                                    }}
                                                >
                                                    {t('address.setDefault')}
                                                </Button>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Paper>

            {/* Address Dialog */}
            {address.isNewAddressDialogOpen && (
                <AddAddressModal
                    open={address.isNewAddressDialogOpen}
                    onClose={() => {
                        address.setIsNewAddressDialogOpen(false);
                        address.isEditMode = false;
                        address.setAddressToEdit(null);
                    }}
                    onSave={address.isEditMode ? address.handleUpdateAddress : address.handleSaveNewAddress}
                    isEditMode={address.isEditMode}
                    addressData={address.addressToEdit}
                />
            )}

            {/* Confirm Dialog */}
            {address.isConfirmDialogOpen && (
                <Dialog
                    open={address.isConfirmDialogOpen}
                    onClose={() => address.setIsConfirmDialogOpen(false)}
                >
                    <DialogTitle>{t('address.change')}</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {t('address.removeItems')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => address.setIsConfirmDialogOpen(false)}
                            color="inherit"
                        >
                            {t('util.cancel')}
                        </Button>
                        <Button
                            onClick={() => {
                                address.setIsConfirmDialogOpen(false);
                                if (address.onConfirmProceed) {
                                    address.onConfirmProceed();
                                }
                            }}
                            variant="contained"
                            color="primary"
                        >
                            {t('util.yes')}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Password Change Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('profile.changePassword')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label={t('profile.oldPassword')}
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label={t('profile.newPassword')}
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            helperText={t('profile.passwordRequirements')}
                        />
                        <TextField
                            fullWidth
                            label={t('profile.confirmPassword')}
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                            helperText={
                                passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''
                                    ? t('profile.passwordMismatch')
                                    : ''
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)} color="inherit">
                        {t('util.cancel')}
                    </Button>
                    <Button
                        onClick={handlePasswordChange}
                        variant="contained"
                        color="primary"
                        disabled={
                            !passwordData.oldPassword ||
                            !passwordData.newPassword ||
                            passwordData.newPassword !== passwordData.confirmPassword
                        }
                    >
                        {t('util.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CustomerProfileSection;
