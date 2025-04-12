package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.AddressRequest;
import com.purpleworld.hufds.dto.response.*;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.CustomerService;
import com.purpleworld.hufds.service.GoogleMapsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final GoogleMapsService googleMapsService;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuRepository menuRepository;
    private final RemovableElementRepository removableElementRepository;

    @Override
    public ResponseEntity<String> dashboard() {
        return ResponseEntity.ok("Welcome, CUSTOMER!");
    }

    @Override
    public ResponseEntity<?> getCustomerAddresses(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Address> addresses = addressRepository.findAllByCustomer(customer);

        if (addresses.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasAddress", false));
        }

        List<AddressResponse> addressResponses = addresses.stream()
                .map(AddressResponse::new)
                .toList();

        return ResponseEntity.ok(Map.of(
                "hasAddress", true,
                "addresses", addressResponses
        ));
    }

    @Override
    public ResponseEntity<?> createAddress(AddressRequest request, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address address = googleMapsService.getAddressFromCoordinates(request.getLatitude(), request.getLongitude());

            address.setCustomer(customer);
            address.setName(request.getName());
            address.setLatitude(request.getLatitude());
            address.setLongitude(request.getLongitude());
            address.setBuildingNumber(request.getBuildingNumber());
            address.setApartmentNumber(request.getApartmentNumber());
            address.setFloor(request.getFloor());
            address.setFullAddress(request.getFullAddress());
            address.setPhoneNumber(request.getPhoneNumber());
            address.setDeliveryNote(request.getDeliveryNote());

            addressRepository.save(address);

            return ResponseEntity.ok("Address saved successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body("Unauthorized: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> setCurrentAddress(Long addressId, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address selectedAddress = addressRepository.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            if (!selectedAddress.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body("Forbidden: You can only select your own address");
            }

            customer.setCurrentAddressId(selectedAddress.getId());
            customerRepository.save(customer);

            return ResponseEntity.ok("Current address set successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getCurrentAddress(String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (email == null || email.isBlank()) {
                response.put("error", "Unauthorized: Invalid or missing token");
                return ResponseEntity.status(401).body(response);
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            if (customer.getCurrentAddressId() == null) {
                response.put("error", "No selected address.");
                return ResponseEntity.status(404).body(response);
            }

            response.put("addressId", customer.getCurrentAddressId());
            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {
            response.put("error", "Error: " + ex.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("error", "Something went wrong: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> getNearestRestaurants(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Long customerCurrentAddressId = customer.getCurrentAddressId();

        if (customerCurrentAddressId == null) {

            return ResponseEntity.badRequest().body("No current address set for customer");
        }

        Optional<Address> customerCurrentAddress = addressRepository.findById(customerCurrentAddressId);

        Address currentAddress = customerCurrentAddress.get();

        double customerLat = currentAddress.getLatitude();
        double customerLng = currentAddress.getLongitude();

        List<Restaurant> restaurants = restaurantRepository.findAll();

        List<RestaurantResponse> nearestRestaurants = new ArrayList<>();
        for (Restaurant restaurant : restaurants) {

            Optional<Address> restaurantAddress = addressRepository.findByRestaurant(restaurant);
            Address currentRestaurantAddress = restaurantAddress.get();
            double restLat = currentRestaurantAddress.getLatitude();
            double restLng = currentRestaurantAddress.getLongitude();

            double distance = calculateHaversine(customerLat, customerLng, restLat, restLng);
            if (distance <= 15.0) {
                RestaurantResponse nearestRestaurant = new RestaurantResponse();
                nearestRestaurant.setId(restaurant.getId());
                nearestRestaurant.setRestaurantName(restaurant.getRestaurantName());
                nearestRestaurant.setProfileImg(restaurant.getProfileImg());
                nearestRestaurant.setRating(4.5);
                nearestRestaurant.setReviews(345);
                nearestRestaurant.setDistanceInKm(distance);
                nearestRestaurants.add(nearestRestaurant);
                nearestRestaurant.setMenu(null);
            }
        }

        nearestRestaurants.sort(Comparator.comparingDouble(RestaurantResponse::getDistanceInKm));

        return ResponseEntity.ok(nearestRestaurants);
    }

    @Override
    @Transactional
    public ResponseEntity<?> getNearestRestaurantFood(String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (email == null || email.isBlank()) {
                response.put("error", "Unauthorized: Invalid or missing token");
                return ResponseEntity.status(401).body(response);
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Long customerCurrentAddressId = customer.getCurrentAddressId();
            if (customerCurrentAddressId == null) {
                response.put("error", "No current address set for customer");
                return ResponseEntity.status(400).body(response);
            }
            Address currentAddress = addressRepository.findById(customerCurrentAddressId)
                    .orElseThrow(() -> new RuntimeException("Current address not found"));

            double customerLat = currentAddress.getLatitude();
            double customerLng = currentAddress.getLongitude();

            // Get all restaurants from the repository
            List<Restaurant> restaurants = restaurantRepository.findAll();

            List<MenuItemCustomerResponse> result = new ArrayList<>();

            for (Restaurant restaurant : restaurants) {

                Optional<Address> restaurantAddressOpt = addressRepository.findByRestaurant(restaurant);
                if (restaurantAddressOpt.isEmpty()) {
                    continue;
                }
                Address restaurantAddress = restaurantAddressOpt.get();
                double restLat = restaurantAddress.getLatitude();
                double restLng = restaurantAddress.getLongitude();

                double distance = calculateHaversine(customerLat, customerLng, restLat, restLng);
                if (distance <= 15.0) { // Only include restaurants within 15 km.


                    Optional<Menu> menu = menuRepository.findById(restaurant.getId());
                    Menu restaurantMenu = menu.get();

                    for (Category category : restaurantMenu.getCategories()){
                        List<MenuItem> categoryFoods = category.getMenuItems();
                        for (MenuItem menuItem : categoryFoods){
                            MenuItemCustomerResponse itemResponse = getMenuItemCustomerResponse(restaurant, menuItem);
                            result.add(itemResponse);

                        }
                    }


                }
            }

            return ResponseEntity.ok(result);
        } catch (RuntimeException ex) {
            response.put("error", "Error: " + ex.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("error", "Something went wrong: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private static MenuItemCustomerResponse getMenuItemCustomerResponse(Restaurant restaurant, MenuItem menuItem) {
        MenuItemCustomerResponse itemResponse = new MenuItemCustomerResponse();
        itemResponse.setId(menuItem.getId());
        itemResponse.setName(menuItem.getName());
        itemResponse.setPrice(menuItem.getPrice());
        itemResponse.setDescription(menuItem.getDescription());
        itemResponse.setImg(menuItem.getImg());
        itemResponse.setRestaurant(new RestaurantResponse(restaurant.getId(),restaurant.getRestaurantName(),null,0,0,0,null));
        return itemResponse;
    }

    @Override
    public ResponseEntity<?> getIngredients(Long menuItemId, String email) {

        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Menu item not found"));

        List<RemovableElementResponse> removableElementResponses = new ArrayList<>();

        for (RemovableElement removableElement : item.getRemovableElements()) {
            RemovableElementResponse response = new RemovableElementResponse(removableElement.getId(), removableElement.getName());
            removableElementResponses.add(response);
        }
        return ResponseEntity.ok(removableElementResponses);
    }

    @Override
    public ResponseEntity<?> deleteAddress(Long addressId, String email) {
        return null;
    }




    private double calculateHaversine(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}