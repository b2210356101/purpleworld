
import { useState, useEffect, useCallback } from 'react';

import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
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

interface CourierProfileSectionProps {
    updateSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const CourierProfileSection: React.FC<CourierProfileSectionProps> = ({ updateSnackbar }) => {
    const { t } = useTranslation();
    const { userInfo } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [phoneError, setPhoneError] = useState(false);
    const [phoneErrorMsg, setPhoneErrorMsg] = useState('');

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        isAvailable: false,
        isWorking: false,
    });

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
                    firstName: response.firstName || '',
                    lastName: response.lastName || '',
                    email: response.email || '',
                    phoneNumber: response.phoneNumber || '',
                    isAvailable: response.isAvailable || false,
                    isWorking: response.isWorking || false,
                  });

            } catch (error) {
                if (!isMounted) return;

                if (userInfo) {
                    setProfileData({
                        firstName: userInfo.username || '',
                        lastName: '',
                        email: localStorage.getItem('email') || '',
                        phoneNumber: localStorage.getItem('phoneNumber') || '',
                        isAvailable: false,
                        isWorking: false,
                    });

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
        setProfileData(prev => ({ ...prev, [name]: value }));


    }, []);

    const handleEditToggle = useCallback(async () => {
        if (editMode) {
            // Save changes
            try {


                if (!/^\d{10}$/.test(profileData.phoneNumber)) {
                    setPhoneError(true);
                    setPhoneErrorMsg(t('register.customer.phoneRequired') || 'Phone number must be 10 digits.');
                    return;
                }

                const dataToSend = {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    phoneNumber: profileData.phoneNumber,
                    isAvailable: profileData.isAvailable,
                    isWorking: profileData.isWorking,
                };

                const response = await updateUserProfile(dataToSend);

                dispatch(updateUserInfo({
                    username: profileData.firstName,
                }));

                updateSnackbar(t('profile.update.success'), 'success');
            } catch (error) {
                console.error('Error updating profile:', error);
                updateSnackbar(t('profile.update.error'), 'error');
                return;
            }
        }

        setEditMode(!editMode);
    }, [editMode, profileData, dispatch, t, updateSnackbar]);

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

                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {profileData.firstName} {profileData.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {profileData.email}
                            </Typography>
                            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                                {t('role.courier')}
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
                                {t('profile.courier.firstName')}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    required
                                />
                            ) : (
                                <Typography variant="body1">{profileData.firstName}</Typography>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('profile.courier.lastName')}
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
                                {t('profile.email')}
                            </Typography>
                            <Typography variant="body1">{profileData.email}</Typography>
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

export default CourierProfileSection;
