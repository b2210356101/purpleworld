import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import GoogleMapComponent from '../GoogleMapComponent';
import { TrackingInfoResponseDTO } from '../../types';

interface TrackingDialogProps {
    open: boolean;
    onClose: () => void;
    trackingInfo: TrackingInfoResponseDTO | null;
    orderId: number | null;
}

const TrackingDialog: React.FC<TrackingDialogProps> = ({
    open,
    onClose,
    trackingInfo,
    orderId
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Live Courier Tracking</DialogTitle>
            <DialogContent>
                {trackingInfo && orderId && (
                    <>
                        <GoogleMapComponent orderId={orderId} />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">
                                Remaining Time: {trackingInfo.remainingDurationMinutes} minutes
                            </Typography>
                            <Typography variant="subtitle1">
                                Remaining Distance: {trackingInfo.remainingDistanceKm.toFixed(2)} km
                            </Typography>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TrackingDialog;