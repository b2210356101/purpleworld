import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="cancel-order-dialog-title"
            aria-describedby="cancel-order-dialog-description"
        >
            <DialogTitle id="cancel-order-dialog-title">
                {t('order.cancelDialog.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="cancel-order-dialog-description">
                    {t('order.cancelDialog.confirmMessage')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {t('order.cancelDialog.keepOrder')}
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    {t('order.cancelDialog.confirmCancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelOrderDialog;