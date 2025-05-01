package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.RoutePointDTO;
import com.purpleworld.hufds.dto.response.TrackingInfoResponseDTO;
import com.purpleworld.hufds.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;
//
//    @PostMapping("/start")
//    public ResponseEntity<String> startTracking(
//            @AuthenticationPrincipal String email,
//            @RequestParam Long orderId,
//            @RequestParam double originLat,
//            @RequestParam double originLng,
//            @RequestParam double destLat,
//            @RequestParam double destLng) {
//        trackingService.startTrackingForOrder(email, orderId, originLat, originLng, destLat, destLng);
//        return ResponseEntity.ok("Tracking started for order " + orderId);
//    }

    @GetMapping("/next")
    public ResponseEntity<TrackingInfoResponseDTO> getNextPoint(
            @AuthenticationPrincipal String email,
            @RequestParam Long orderId) {
        return ResponseEntity.ok(trackingService.getNextLocation(email, orderId));
    }

    @GetMapping("/full-route")
    public ResponseEntity<List<RoutePointDTO>> getFullRoute(
            @AuthenticationPrincipal String email,
            @RequestParam Long orderId) {
        return ResponseEntity.ok(trackingService.getFullRoute(email, orderId));
    }
}