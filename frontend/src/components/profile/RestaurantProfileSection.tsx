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
    Divider,
    InputAdornment
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera as PhotoCameraIcon,
    Place as PlaceIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
} from '../../utils/api';
import { updateUserInfo } from '../../store/slices/authSlice';
import Loading from '../Loading';

interface RestaurantProfileSectionProps {
    updateSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const RestaurantProfileSection: React.FC<RestaurantProfileSectionProps> = ({ updateSnackbar }) => {
    const { t } = useTranslation();
    const { userInfo } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [phoneError, setPhoneError] = useState(false);
    const [phoneErrorMsg, setPhoneErrorMsg] = useState('');

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        restaurantName: '',
        email: '',
        phoneNumber: '',
        profileImg: userInfo?.profileImage || '',
        managerFirstName: '',
        managerLastName: '',
        maxDeliveryDistance: 0,
        minOrderAmount: 0
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
        let isMounted = true;

        const fetchProfileData = async () => {
            if (!isMounted) return;
            setLoading(true);

            try {
                const response = await getUserProfile();

                if (!isMounted) return;

                setProfileData({
                    restaurantName: response.restaurantName || '',
                    email: response.email || '',
                    phoneNumber: response.phoneNumber || '',
                    profileImg: response.profileImg || '',
                    managerFirstName: response.managerFirstName || '',
                    managerLastName: response.managerLastName || '',
                    maxDeliveryDistance: response.maxDeliveryDistance || 0,
                    minOrderAmount: response.minOrderAmount || 0
                });

                setProfileImgPreview(response.profileImg);
            } catch (error) {
                if (!isMounted) return;

                if (userInfo) {
                    setProfileData({
                        restaurantName: userInfo.username || '',
                        email: localStorage.getItem('email') || '',
                        phoneNumber: localStorage.getItem('phoneNumber') || '',
                        profileImg: userInfo.profileImage || '',
                        managerFirstName: '',
                        managerLastName: '',
                        maxDeliveryDistance: 0,
                        minOrderAmount: 0
                    });

                    setProfileImgPreview(userInfo.profileImage);
                }

                updateSnackbar(t('profile.error.fetch'), 'error');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfileData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Handle numeric values
        if (name === 'maxDeliveryDistance' || name === 'minOrderAmount') {
            setProfileData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : Math.max(0, parseInt(value))
            }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
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
                    restaurantName: profileData.restaurantName,
                    managerFirstName: profileData.managerFirstName,
                    managerLastName: profileData.managerLastName,
                    maxDeliveryDistance: profileData.maxDeliveryDistance,
                    minOrderAmount: profileData.minOrderAmount
                };

                const response = await updateUserProfile(dataToSend);

                dispatch(updateUserInfo({
                    username: profileData.restaurantName,
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loading />
            </Box>
        );
    }

    return (
        <>
            {/* Restaurant Profile Information Section */}
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
                                alt={profileData.restaurantName}
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
                                {profileData.restaurantName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {profileData.email}
                            </Typography>
                            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                                {t('role.restaurant')}
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

                {/* Restaurant Profile Form */}
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.restaurant.name')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    name="restaurantName"
                                    value={profileData.restaurantName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    required
                                />
                            ) : (
                                <Typography variant="body1">{profileData.restaurantName}</Typography>
                            )}
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
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.restaurant.manager')}
                            </Typography>
                            {editMode ? (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        name="managerFirstName"
                                        label={t('profile.firstName')}
                                        value={profileData.managerFirstName}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        name="managerLastName"
                                        label={t('profile.lastName')}
                                        value={profileData.managerLastName}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                    />
                                </Box>
                            ) : (
                                <Typography variant="body1">
                                    {profileData.managerFirstName} {profileData.managerLastName}
                                </Typography>
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
                                {t('profile.restaurant.maxDistance')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="maxDeliveryDistance"
                                    value={profileData.maxDeliveryDistance}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">km</InputAdornment>,
                                        inputProps: { min: 0 }
                                    }}
                                />
                            ) : (
                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {profileData.maxDeliveryDistance} km
                                    <PlaceIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
                                </Typography>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.restaurant.minOrder')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="minOrderAmount"
                                    value={profileData.minOrderAmount}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                                        inputProps: { min: 0 }
                                    }}
                                />
                            ) : (
                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {profileData.minOrderAmount} ₺
                                </Typography>
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

export default RestaurantProfileSection;
