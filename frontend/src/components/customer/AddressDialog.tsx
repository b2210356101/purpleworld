import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    IconButton,
    Grid,
    Alert
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from 'react-router-dom';
import { Address } from '../../types';
import { useTranslation } from 'react-i18next';

interface AddressDialogProps {
    open: boolean;
    onClose: () => void;
    addresses: Address[];
    selectedAddress: number | null;
    pendingAddressId: number | null;
    handleAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveAddresses: () => void;
    handleAddNewAddress: () => void;
    handleEditAddress: (address: Address) => void;
    handleDeleteAddress: (addressId: number) => void;
    error: string | null;
}

const AddressDialog: React.FC<AddressDialogProps> = ({
    open,
    onClose,
    addresses,
    selectedAddress,
    pendingAddressId,
    handleAddressChange,
    handleSaveAddresses,
    handleAddNewAddress,
    handleEditAddress,
    handleDeleteAddress,
    error
}) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{t('address.selectNew')}</DialogTitle>
            <DialogContent>
                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : addresses.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('address.dontHave')}
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {t('address.saved')}
                        </Typography>
                        <RadioGroup
                            value={pendingAddressId} 
                            onChange={handleAddressChange}
                        >
                            {addresses.map((address, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                    <FormControlLabel
                                        value={address.addressId}
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="body1">{address.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{address.fullAddress}</Typography>
                                                <Typography variant="body2" color="text.secondary">{address.phoneNumber}</Typography>
                                            </Box>
                                        }
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEditAddress(address)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteAddress(address.addressId)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </RadioGroup>
                    </Box>
                )}

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            fullWidth
                            onClick={handleAddNewAddress}
                        >
                            {t('address.add')}
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                            component={Link}
                            to="/profile"
                            variant="outlined"
                            fullWidth
                            sx={{ color: 'secondary.main', borderColor: 'secondary.main' }}
                        >
                            {t('address.manage')}
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="secondary">
                    {t('util.cancel')}
                </Button>
                <Button
                    onClick={handleSaveAddresses}
                    disabled={!pendingAddressId && addresses.length > 0}
                    variant="contained"
                    color="primary"
                >
                    {t('address.select')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddressDialog;