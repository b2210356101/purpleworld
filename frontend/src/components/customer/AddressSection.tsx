import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AddressSectionProps {
    selectedAddress: number | null;
    handleDialogOpen: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
    selectedAddress,
    handleDialogOpen
}) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
            {!selectedAddress && (
                <Box sx={{ p: 5, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
                    <Typography variant="h5" color="primary" gutterBottom>
                        {t('address.pleaseSelect')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        {t('address.selectDescription')}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleDialogOpen}
                        startIcon={<LocationOn />}
                        size="large"
                    >
                        {t('address.select')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default AddressSection;