import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface CancelOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
    open,
    onClose,
    onConfirm
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="cancel-order-dialog-title"
            aria-describedby="cancel-order-dialog-description"
        >
            <DialogTitle id="cancel-order-dialog-title">
                Cancel Order
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="cancel-order-dialog-description">
                    Are you sure you want to cancel this order? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    No, Keep Order
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Yes, Cancel Order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelOrderDialog;