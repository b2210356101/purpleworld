import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, Grid,
    CircularProgress
} from '@mui/material';
import { Address } from '../../types';
import { MyLocation } from '@mui/icons-material';

const GOOGLE_MAPS_API_KEY = "AIzaSyBkEQfPxLwjzhWwPshlQAdIuWTHlk80Vls";
let googleMapsScriptLoaded = false;

declare global {
    interface Window {
        initMap: () => void;
        google: any;
    }
}

interface AddAddressModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (address: Omit<Address, 'id'>, location: { lat: number; lng: number } | null) => void;
}

const AddAddressModal = ({ open, onClose, onSave }: AddAddressModalProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapObject, setMapObject] = useState<google.maps.Map | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState(false);
    const [locationErrorMsg, setLocationErrorMsg] = useState("");
    const [locating, setLocating] = useState(false);
    // Flag to track if the modal has been opened at least once

    const [address, setAddress] = useState<Omit<Address, 'id'>>({
        name: '',
        fullAddress: '',
        phoneNumber: '',
        apartmentNumber: '',
        floor: '',
        buildingNumber: '',
        deliveryNote: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setAddress({
            ...address,
            [name]: value
        });

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validate title
        if (!address.name.trim()) {
            newErrors.name = 'Address title is required';
        } else if (address.name.trim().length < 3) {
            newErrors.name = 'Title must be at least 3 characters';
        }

        // Validate full address
        if (!address.fullAddress.trim()) {
            newErrors.fullAddress = 'Address is required';
        } else if (address.fullAddress.trim().length < 10) {
            newErrors.fullAddress = 'Please provide a more detailed address';
        }

        // Validate phone number
        if (!address.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(address.phoneNumber.replace(/\s/g, ''))) {
                newErrors.phoneNumber = 'Enter a valid phone number';
            }
        }

        if (!address.apartmentNumber.trim()) {
            newErrors.apartmentNumber = 'Apartment name is required';
        }

        if (!address.floor.trim()) {
            newErrors.floor = 'Floor is required';
        }

        if (!address.buildingNumber.trim()) {
            newErrors.buildingNumber = 'Door number is required';
        }

        // Validate location is selected on map
        if (!location) {
            setLocationError(true);
            setLocationErrorMsg('Please select a location on the map');
        } else {
            setLocationError(false);
            setLocationErrorMsg('');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && !locationError;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                onSave(address, location);
                resetForm();
            } catch (error) {
                console.error('Error in address form submission:', error);
                if (error instanceof Error) {
                    if (error.message.includes('location')) {
                        setLocationError(true);
                        setLocationErrorMsg(error.message);
                    }
                }
            }
        }
    };

    const resetForm = () => {
        setAddress({
            name: '',
            fullAddress: '',
            phoneNumber: '',
            apartmentNumber: '',
            floor: '',
            buildingNumber: '',
            deliveryNote: '',
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };


    // ai-gen start (claude 3.7)
    // Load Google Maps script only once
    useEffect(() => {
        if (googleMapsScriptLoaded) {
            return;
        }

        window.initMap = () => {
            // We'll initialize the map when the modal is open
            googleMapsScriptLoaded = true;
        };

        const loadGoogleMapsScript = () => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        };

        loadGoogleMapsScript();

        return () => {
            if (window.initMap) {
                window.initMap = () => { };
            }
        };
    }, []);

    // Initialize map when modal is open
    useEffect(() => {
        if (open) {
            // Reset map object when reopening to force reinitialization
            if (!mapObject) {
                // Use a small delay to ensure the modal is fully rendered
                const timer = setTimeout(() => {
                    initializeMap();
                }, 300);

                return () => clearTimeout(timer);
            } else {
                // If map already exists, just trigger resize
                const timer = setTimeout(() => {
                    window.google?.maps.event.trigger(mapObject, 'resize');

                    // Center the map again after resize
                    if (location) {
                        mapObject.setCenter(location);
                    } else {
                        mapObject.setCenter({ lat: 39.92077, lng: 32.85411 });
                    }
                }, 100);

                return () => clearTimeout(timer);
            }
        } else {
            // Clear map object when modal closes to ensure it reinitializes on next open
            setMapObject(null);
        }
    }, [open, mapObject, location]);

    const initializeMap = () => {
        if (!mapRef.current || !window.google || mapObject) return;

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 39.92077, lng: 32.85411 },
                zoom: 6,
            });
            setMapObject(map);

            let marker: google.maps.Marker | null = null;

            map.addListener("click", (event: google.maps.MapMouseEvent) => {
                if (event.latLng) {
                    if (marker) marker.setMap(null);
                    marker = new window.google.maps.Marker({
                        position: event.latLng,
                        map: map,
                    });
                    setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                    setLocationError(false);
                    setLocationErrorMsg("");
                }
            });
        } catch (error) {
            console.error("Error initializing Google Maps:", error);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (mapObject) {
                    mapObject.setCenter(userLocation);
                    mapObject.setZoom(17);
                }

                setLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your location. Please check your location permissions.");
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000
            }
        );
    };
    // ai-gen end

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                transition: {
                    onEntered: () => {
                        if (mapObject) {
                            window.google?.maps.event.trigger(mapObject, 'resize');
                        }
                    }
                }
            }}
        >
            <DialogTitle>Add New Address</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3, mt: 1 }}>
                    <TextField
                        fullWidth
                        name="name"
                        label="Address Title"
                        placeholder="e.g. My Home, Office"
                        variant="outlined"
                        value={address.name}
                        onChange={handleChange}
                        required
                        margin="normal"
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    {/* Google Maps Container */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Select Location on Map
                        </Typography>

                        <Button
                            startIcon={locating ? <CircularProgress size={16} color="inherit" /> : <MyLocation />}
                            onClick={getCurrentLocation}
                            size="small"
                            disabled={locating}
                        >
                            {locating ? 'Getting location...' : 'Get My location'}
                        </Button>
                    </Box>

                    <Box
                        ref={mapRef}
                        sx={{
                            height: 400,
                            width: "100%",
                            borderRadius: 2,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    />

                    {location ? (
                        <Typography fontSize={14} color="text.secondary">
                            Selected Location: {location.lat.toFixed(5)},{" "}
                            {location.lng.toFixed(5)}
                        </Typography>
                    ) : (
                        locationError && (
                            <Typography fontSize={14} color="error">
                                {locationErrorMsg}
                            </Typography>
                        )
                    )}

                    <TextField
                        fullWidth
                        name="fullAddress"
                        label="Full Address"
                        placeholder="Street name, neighborhood, etc."
                        variant="outlined"
                        multiline
                        rows={2}
                        value={address.fullAddress}
                        onChange={handleChange}
                        required
                        margin="normal"
                        error={!!errors.fullAddress}
                        helperText={errors.fullAddress}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Building Details
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                name="apartmentNumber"
                                label="Apartment/Building Name"
                                placeholder="e.g. Asistan Evleri"
                                variant="outlined"
                                value={address.apartmentNumber}
                                onChange={handleChange}
                                required
                                margin="normal"
                                error={!!errors.apartmentNumber}
                                helperText={errors.apartmentNumber}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                name="floor"
                                label="Floor"
                                placeholder="e.g. 3"
                                variant="outlined"
                                value={address.floor}
                                onChange={handleChange}
                                required
                                margin="normal"
                                error={!!errors.floor}
                                helperText={errors.floor}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                name="buildingNumber"
                                label="Door Number"
                                placeholder="e.g. 7"
                                variant="outlined"
                                value={address.buildingNumber}
                                onChange={handleChange}
                                required
                                margin="normal"
                                error={!!errors.buildingNumber}
                                helperText={errors.buildingNumber}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        fullWidth
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="e.g. 5551234567"
                        variant="outlined"
                        value={address.phoneNumber}
                        onChange={handleChange}
                        required
                        margin="normal"
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber || "Format: 5XXXXXXXXX"}
                    />

                    <TextField
                        fullWidth
                        name="deliveryNote"
                        label="Delivery Instructions (optional)"
                        placeholder="Special instructions for courier"
                        variant="outlined"
                        multiline
                        rows={2}
                        value={address.deliveryNote}
                        onChange={handleChange}
                        margin="normal"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!address.name || !address.fullAddress}
                    variant="contained"
                    color="primary"
                >
                    Add Address
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddAddressModal;