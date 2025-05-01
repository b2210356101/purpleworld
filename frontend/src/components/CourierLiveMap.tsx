import React, { useEffect, useRef } from 'react';

interface CourierTrackingMapProps {
    courierLocation: { lat: number; lng: number };
}

const CourierTrackingMap: React.FC<CourierTrackingMapProps> = ({ courierLocation }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        if (!window.google || !mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: courierLocation,
                zoom: 15,
            });

            markerRef.current = new window.google.maps.Marker({
                position: courierLocation,
                map: mapInstance.current,
                title: 'Courier Location',
            });
        } else {
            // Move the marker to new location
            markerRef.current?.setPosition(courierLocation);
            mapInstance.current.setCenter(courierLocation);
        }
    }, [courierLocation]);

    return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: 12 }} />;
};

export default CourierTrackingMap;
