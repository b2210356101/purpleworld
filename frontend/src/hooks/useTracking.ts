import { useState, useEffect, useCallback, useRef } from 'react';
import { TrackingInfoResponseDTO } from '../types';
import { getNextLocation } from '../utils/api';
import { useTranslation } from 'react-i18next';

export const useTracking = () => {
    const { t } = useTranslation();
    const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState<TrackingInfoResponseDTO | null>(null);
    const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<number | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    
    // Add ref to prevent state updates after unmount
    const isMounted = useRef(true);
    
    // Tracking interval reference for cleanup
    const trackingIntervalRef = useRef<number | null>(null);

    const handleTrackOrder = useCallback(async (orderId: number) => {
        try {
            const nextPoint = await getNextLocation(orderId);

            if (!isMounted.current) return;

            if (nextPoint.lat === 0 && nextPoint.lng === 0 && !nextPoint.completed) {
                setSnackbarMessage("Tracking is not available yet.");
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
                return;
            }

            if (nextPoint.lat === 0 && nextPoint.lng === 0 && nextPoint.completed) {
                setSnackbarMessage(t("tracking.orderDelivered"));
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
                return;
            }

            setTrackingInfo(nextPoint);
            setActiveTrackingOrderId(orderId);
            setIsTrackingDialogOpen(true);
        } catch (error) {
            if (!isMounted.current) return;
            
            setSnackbarMessage(t("tracking.trackingNotAvailable"));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }, []);

    // Update tracking info when dialog is open
    useEffect(() => {
        if (isTrackingDialogOpen && activeTrackingOrderId) {
            // Clear any existing interval
            if (trackingIntervalRef.current) {
                clearInterval(trackingIntervalRef.current);
                trackingIntervalRef.current = null;
            }
            
            const fetchTrackingData = async () => {
                if (!isMounted.current) return;
                
                try {
                    const data = await getNextLocation(activeTrackingOrderId);
                    
                    if (!isMounted.current) return;
                    
                    if (data.completed) {
                        alert(t("tracking.orderDeliveredSoon"));
                        setIsTrackingDialogOpen(false);
                    } else {
                        setTrackingInfo(data);
                    }
                } catch (error) {
                    console.error("Error while fetching tracking data:", error);
                    if (isMounted.current) {
                        setIsTrackingDialogOpen(false);
                    }
                }
            };

            // Fetch immediately
            fetchTrackingData();
            
            // Then set up interval
            trackingIntervalRef.current = window.setInterval(fetchTrackingData, 3000);
        } else if (trackingIntervalRef.current) {
            // Clear interval if dialog is closed
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }

        return () => {
            if (trackingIntervalRef.current) {
                clearInterval(trackingIntervalRef.current);
                trackingIntervalRef.current = null;
            }
        };
    }, [isTrackingDialogOpen, activeTrackingOrderId]);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        
        return () => {
            isMounted.current = false;
            if (trackingIntervalRef.current) {
                clearInterval(trackingIntervalRef.current);
            }
        };
    }, []);

    return {
        isTrackingDialogOpen,
        trackingInfo,
        activeTrackingOrderId,
        snackbarOpen,
        snackbarMessage,
        snackbarSeverity,
        handleTrackOrder,
        setIsTrackingDialogOpen,
        setSnackbarOpen
    };
};