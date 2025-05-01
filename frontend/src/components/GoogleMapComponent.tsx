import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, Polyline } from "@react-google-maps/api";
import { getNextLocation, getFullRoute } from "../utils/api"; // importlarına dikkat et
import RestaurantMarker from "../assets/restaurant-location.png";

const containerStyle = {
    width: "100%",
    height: "400px",
};

const GoogleMapComponent = ({ orderId }: { orderId: number }) => {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [polyline, setPolyline] = useState<{ lat: number; lng: number }[]>([]);
    const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);
    const [completed, setCompleted] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyBkEQfPxLwjzhWwPshlQAdIuWTHlk80Vls"
    });

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

    // Kurye ilerledikçe nokta al
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getNextLocation(orderId);
                const { lat, lng, completed } = res;
                setPosition({ lat, lng });
                setCompleted(completed);
                setPolyline(prev => [...prev, { lat, lng }]);

                if (completed) {
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Next location fetch error", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [orderId]);

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={position || route[0]}
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
        <div>Loading map...</div>
    );
};

export default GoogleMapComponent;