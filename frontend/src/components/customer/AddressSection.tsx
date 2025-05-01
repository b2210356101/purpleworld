import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface AddressSectionProps {
    selectedAddress: number | null;
    handleDialogOpen: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
    selectedAddress,
    handleDialogOpen
}) => {
    return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
            {!selectedAddress && (
                <Box sx={{ p: 5, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h5" color="primary" gutterBottom>
                        Please Select an Address
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        To view restaurants and foods near you, please select a delivery address.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleDialogOpen}
                        startIcon={<LocationOn />}
                        size="large"
                    >
                        Select Address
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default AddressSection;