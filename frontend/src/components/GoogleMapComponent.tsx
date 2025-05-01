import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, Polyline } from "@react-google-maps/api";
import { getNextLocation, getFullRoute } from "../utils/api";
import RestaurantMarker from "../assets/restaurant-location.png";
import {Box, CircularProgress, Typography} from "@mui/material";

const containerStyle = {
    width: "100%",
    height: "400px",
};

const GoogleMapComponent = ({ orderId }: { orderId: number }) => {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [polyline, setPolyline] = useState<{ lat: number; lng: number }[]>([]);
    const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyBkEQfPxLwjzhWwPshlQAdIuWTHlk80Vls"
    });

    // Fetch full route once
    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const full = await getFullRoute(orderId);
                setRoute(full);
            } catch (err) {
                console.error("Full route fetch error", err);
            }
        };
        fetchRoute();
    }, [orderId]);

    // Periodically fetch next courier location
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getNextLocation(orderId);
                const { lat, lng, completed } = res;
                const newPosition = { lat, lng };

                setPosition(newPosition);
                setPolyline(prev => [...prev, newPosition]);

                if (!mapCenter) {
                    setMapCenter(newPosition);
                }

                if (completed) clearInterval(interval);
            } catch (err) {
                console.error("Next location fetch error", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [orderId, mapCenter]);

    return isLoaded && mapCenter ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
        >
            <Polyline path={route} options={{ strokeColor: "#00BFFF", strokeWeight: 4 }} />
            <Polyline path={polyline} options={{ strokeColor: "#FF0000", strokeWeight: 2 }} />

            {position && (
                <Marker
                    position={position}
                    icon={{
                        url: RestaurantMarker,
                        scaledSize: new window.google.maps.Size(40, 40),
                    }}
                />
            )}
        </GoogleMap>
    ) : (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "400px",
                flexDirection: "column",
                textAlign: "center",
            }}
        >
            <CircularProgress color="primary" />
            <Typography
                variant="subtitle1"
                color="primary"
                sx={{ mt: 2, fontWeight: 500 }}
            >
                Loading map...
            </Typography>
        </Box>
    );
};

export default GoogleMapComponent;