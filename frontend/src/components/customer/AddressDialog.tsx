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

interface AddressDialogProps {
    open: boolean;
    onClose: () => void;
    addresses: Address[];
    selectedAddress: number | null;
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
    handleAddressChange,
    handleSaveAddresses,
    handleAddNewAddress,
    handleEditAddress,
    handleDeleteAddress,
    error
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Select Your Addresses</DialogTitle>
            <DialogContent>
                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : addresses.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        You don't have any saved addresses yet. Please add a new address.
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Your saved addresses
                        </Typography>
                        <RadioGroup
                            value={selectedAddress}
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
                            Add New Address
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
                            Manage Addresses
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSaveAddresses}
                    disabled={!selectedAddress && addresses.length > 0}
                    variant="contained"
                    color="primary"
                >
                    Select Address
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddressDialog;