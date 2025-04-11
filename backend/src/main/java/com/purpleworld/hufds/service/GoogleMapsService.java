package com.purpleworld.hufds.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.purpleworld.hufds.entity.Address;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

// ai-gen start(gpt-4,0)
@Service
@RequiredArgsConstructor
public class GoogleMapsService {

    @Value("${google.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public Address getAddressFromCoordinates(Double lat, Double lng) {
        String url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + apiKey;

        JsonNode root = restTemplate.getForObject(url, JsonNode.class);

        Address address = new Address();
        if (root != null && root.has("results") && root.get("results").size() > 0) {
            JsonNode components = root.get("results").get(0).get("address_components");

            for (JsonNode component : components) {
                String type = component.get("types").get(0).asText();
                String longName = component.get("long_name").asText();

                switch (type) {
                    case "administrative_area_level_1" -> address.setCity(longName);
                    case "administrative_area_level_2" -> address.setDistrict(longName);
                    case "administrative_area_level_4" -> address.setNeighborhood(longName);
                    case "route" -> address.setStreet(longName);
                    case "street_number" -> address.setBuildingNumber(longName);
                    case "postal_code" -> address.setPostalCode(longName);
                }
            }

            address.setLatitude(lat);
            address.setLongitude(lng);
            address.setFullAddress(root.get("results").get(0).get("formatted_address").asText());
        }

        return address;
    }

    public TravelInfo getTravelInfo(Double originLat, Double originLng, Double destinationLat, Double destinationLng) {
        String url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric" +
                "&origins=" + originLat + "," + originLng +
                "&destinations=" + destinationLat + "," + destinationLng +
                "&key=" + apiKey;

        JsonNode root = restTemplate.getForObject(url, JsonNode.class);
        TravelInfo travelInfo = new TravelInfo();

        if (root != null
                && root.has("rows")
                && root.get("rows").size() > 0
                && root.get("rows").get(0).has("elements")
                && root.get("rows").get(0).get("elements").size() > 0) {

            JsonNode element = root.get("rows").get(0).get("elements").get(0);
            if (element.has("status") && "OK".equals(element.get("status").asText())) {

                int durationSeconds = element.get("duration").get("value").asInt();
                travelInfo.setDurationInMinutes(durationSeconds / 60);

                double distanceMeters = element.get("distance").get("value").asDouble();
                travelInfo.setDistanceInKilometers(distanceMeters / 1000.0);
            }
        }
        return travelInfo;
    }

    @Data
    public static class TravelInfo {
        private int durationInMinutes;
        private double distanceInKilometers;
    }

}
// ai-gen end