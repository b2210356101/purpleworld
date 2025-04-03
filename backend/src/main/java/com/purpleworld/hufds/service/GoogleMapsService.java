package com.purpleworld.hufds.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.purpleworld.hufds.entity.Address;
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
}
// ai-gen end