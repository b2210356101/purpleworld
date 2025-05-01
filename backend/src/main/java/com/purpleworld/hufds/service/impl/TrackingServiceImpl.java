package com.purpleworld.hufds.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.purpleworld.hufds.dto.RoutePointDTO;
import com.purpleworld.hufds.dto.response.TrackingInfoResponseDTO;
import com.purpleworld.hufds.entity.Address;
import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.repository.OrderGroupRepository;
import com.purpleworld.hufds.repository.OrderRepository;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.service.TrackingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final OrderRepository orderRepository;

    private final Map<Long, List<RoutePointDTO>> orderRoutes    = new HashMap<>();
    private final Map<Long, Integer>             orderProgress  = new HashMap<>();
    private final Map<Long, Long>                lastUpdateTime = new HashMap<>();

    private final long STEP_INTERVAL_MS = 1000;
    private final CustomerRepository customerRepository;
    private final OrderGroupRepository orderGroupRepository;
    private final CourierRepository courierRepository;
    private final AddressRepository addressRepository;

    @Value("${google.api.key}")
    private String apiKey;

    @Override
    public void startTrackingForOrder(String email, Long orderId,
                                      double originLat, double originLng,
                                      double destLat, double destLng) {

        OrderGroup orderGroup = orderGroupRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Group not found"));

        if (orderRoutes.containsKey(orderId)) {
            return;
        }

        String url = String.format(
                "https://maps.googleapis.com/maps/api/directions/json?origin=%f,%f&destination=%f,%f&key=%s",
                originLat, originLng, destLat, destLng, apiKey
        );

        JsonNode root = restTemplate.getForObject(url, JsonNode.class);
        List<RoutePointDTO> routePoints = new ArrayList<>();

        if (root != null && root.has("routes") && root.get("routes").size() > 0) {
            String encoded = root.get("routes")
                    .get(0)
                    .get("overview_polyline")
                    .get("points")
                    .asText();
            routePoints = decodePolyline(encoded);
        }

        orderRoutes.put(orderId, routePoints);
        orderProgress.put(orderId, 0);
        lastUpdateTime.put(orderId, System.currentTimeMillis());
    }

    @Override
    @Transactional
    public TrackingInfoResponseDTO getNextLocation(String email, Long orderId) {
        OrderGroup order = orderGroupRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Optional<Customer> customer = customerRepository.findByEmail(email);

        if (!order.getOrder().getCustomer().getId().equals(customer.get().getId())) {
            throw new AccessDeniedException("This order does not belong to you.");
        }

        if (!orderRoutes.containsKey(orderId)) {
            return new TrackingInfoResponseDTO(
                    0, 0, 0, 0, false
            );
        }

        List<RoutePointDTO> points = orderRoutes.get(orderId);
        int idx = orderProgress.getOrDefault(orderId, 0);

        if (idx >= points.size()) {

            RoutePointDTO end = points.get(points.size() - 1);
            return new TrackingInfoResponseDTO(
                    end.getLat(), end.getLng(), 0, 0, true
            );
        }

        RoutePointDTO current = points.get(idx);
        RoutePointDTO destination = points.get(points.size() - 1);

        String matrixUrl = String.format(
                "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=%f,%f&destinations=%f,%f&key=%s",
                current.getLat(), current.getLng(),
                destination.getLat(), destination.getLng(),
                apiKey
        );
        JsonNode matrix = restTemplate.getForObject(matrixUrl, JsonNode.class);

        int durationMin = 0;
        double distanceKm = 0;
        if (matrix != null && matrix.has("rows")) {
            JsonNode elem = matrix.get("rows").get(0).get("elements").get(0);
            if ("OK".equals(elem.get("status").asText())) {
                durationMin = elem.get("duration").get("value").asInt() / 60;
                distanceKm = elem.get("distance").get("value").asDouble() / 1000.0;
            }
        }

        return new TrackingInfoResponseDTO(
                current.getLat(), current.getLng(),
                durationMin, distanceKm,
                false
        );
    }

    @Scheduled(fixedRateString = "${tracking.step-interval-ms:1000}")
    @Transactional
    public void advanceAll() {
        long now = System.currentTimeMillis();

        for (Long orderId : new ArrayList<>(orderRoutes.keySet())) {
            int idx = orderProgress.getOrDefault(orderId, 0);
            List<RoutePointDTO> pts = orderRoutes.get(orderId);

            if (idx < pts.size()) {
                long last = lastUpdateTime.getOrDefault(orderId, 0L);
                if (now - last >= STEP_INTERVAL_MS) {
                    orderProgress.put(orderId, idx + 1);
                    lastUpdateTime.put(orderId, now);
                }
            }
            else {
                System.out.println("Delivery completed: OrderId #" + orderId);
            }
        }
    }

    @Override
    @Transactional
    public List<RoutePointDTO> getFullRoute(String email, Long orderId) {
        OrderGroup orderGroup = orderGroupRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Optional<Customer> customer = customerRepository.findByEmail(email);

        if (!orderGroup.getOrder().getCustomer().getId().equals(customer.get().getId())) {
            throw new AccessDeniedException("This order does not belong to you.");
        }

        if (!orderRoutes.containsKey(orderId)) {
            throw new IllegalArgumentException("Tracking not started for order " + orderId);
        }

        return orderRoutes.get(orderId);
    }

    private List<RoutePointDTO> decodePolyline(String encoded) {
        List<RoutePointDTO> poly = new ArrayList<>();
        int index = 0, len = encoded.length(), lat = 0, lng = 0;

        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            double latitude = lat / 1E5;
            double longitude = lng / 1E5;
            poly.add(new RoutePointDTO(latitude, longitude));
        }
        return poly;
    }

    public void clearTracking(Long orderId) {
        orderRoutes.remove(orderId);
        orderProgress.remove(orderId);
        lastUpdateTime.remove(orderId);
    }
}