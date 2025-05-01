// Interface: TrackingService.java
package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.RoutePointDTO;
import com.purpleworld.hufds.dto.response.TrackingInfoResponseDTO;

import java.util.List;

public interface TrackingService {

    void startTrackingForOrder(
            String email,
            Long orderId,
            double originLat,
            double originLng,
            double destLat,
            double destLng
    );

    TrackingInfoResponseDTO getNextLocation(String email, Long orderId);

    List<RoutePointDTO> getFullRoute(String email, Long orderId);
}