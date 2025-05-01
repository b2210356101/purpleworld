package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.CustomerCurrentOrderDTO;
import com.purpleworld.hufds.dto.CustomerOrderSummaryDTO;
import com.purpleworld.hufds.dto.OrderDetailsResponse;
import com.purpleworld.hufds.dto.OrderItemDTO;
import com.purpleworld.hufds.dto.request.AddressRequest;
import com.purpleworld.hufds.dto.response.*;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.CustomerService;
import com.purpleworld.hufds.service.GoogleMapsService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final GoogleMapsService googleMapsService;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuRepository menuRepository;
    private final CartRepository cartRepository;
    private final OrderGroupRepository orderGroupRepository;
    private final OrderRepository orderRepository;

    @Override
    public ResponseEntity<String> dashboard() {
        return ResponseEntity.ok("Welcome, CUSTOMER!");
    }

    @Override
    @Transactional
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
                "addresses", addressResponses));
    }

    @Override
    @Transactional
    public ResponseEntity<?> createAddress(AddressRequest request, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address address = googleMapsService.getAddressFromCoordinates(request.getLatitude(),
                    request.getLongitude());

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
    @Transactional
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

            Optional<Cart> cart = cartRepository.findByCustomerId(customer.getId());

            if (cart.isPresent()) {
                Cart existingCart = cart.get();

                if (customer.getCurrentAddressId() != null && !customer.getCurrentAddressId().equals(addressId)) {
                    if (existingCart.getCartGroups() != null && !existingCart.getCartGroups().isEmpty()) {
                        existingCart.getCartGroups().clear();
                        cartRepository.save(existingCart);
                    }

                }
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
    @Transactional
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
    public ResponseEntity<?> deleteAddress(Long addressId, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address address = addressRepository.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            if (!address.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body("Forbidden: You can only delete your own addresses");
            }

            if (Objects.equals(customer.getCurrentAddressId(), addressId)) {
                Optional<Cart> cart = cartRepository.findByCustomerId(customer.getId());

                if (cart.isPresent()) {
                    Cart existingCart = cart.get();

                    if (!existingCart.getCartGroups().isEmpty()) {
                        existingCart.getCartGroups().clear();
                        cartRepository.save(existingCart);
                    }
                }

                customer.setCurrentAddressId(null);
                customerRepository.save(customer);
            }

            addressRepository.delete(address);
            return ResponseEntity.ok("Address deleted successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateAddress(Long addressId, AddressRequest request, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address address = addressRepository.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            if (!address.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body("Forbidden: You can only update your own address");
            }

            Address updatedFromGoogle = googleMapsService.getAddressFromCoordinates(
                    request.getLatitude(), request.getLongitude());

            address.setLatitude(request.getLatitude());
            address.setLongitude(request.getLongitude());
            address.setName(request.getName());
            address.setFullAddress(request.getFullAddress());
            address.setBuildingNumber(request.getBuildingNumber());
            address.setApartmentNumber(request.getApartmentNumber());
            address.setFloor(request.getFloor());
            address.setPhoneNumber(request.getPhoneNumber());
            address.setDeliveryNote(request.getDeliveryNote());

            address.setCity(updatedFromGoogle.getCity());
            address.setDistrict(updatedFromGoogle.getDistrict());
            address.setNeighborhood(updatedFromGoogle.getNeighborhood());
            address.setStreet(updatedFromGoogle.getStreet());

            if (Objects.equals(customer.getCurrentAddressId(), addressId)) {
                Optional<Cart> cart = cartRepository.findByCustomerId(customer.getId());

                if (cart.isPresent()) {
                    Cart existingCart = cart.get();

                    if (!existingCart.getCartGroups().isEmpty()) {
                        existingCart.getCartGroups().clear();
                        cartRepository.save(existingCart);
                    }
                }
            }

            addressRepository.save(address);

            return ResponseEntity.ok("Address updated successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
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
            if (distance <= 15.0 && restaurant.getStatus().equals(AccountStatus.APPROVED)) {
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
                if (distance <= 15.0 && restaurant.getStatus().equals(AccountStatus.APPROVED)) {

                    Optional<Menu> menu = menuRepository.findById(restaurant.getId());
                    Menu restaurantMenu = menu.get();

                    for (Category category : restaurantMenu.getCategories()) {
                        List<MenuItem> categoryFoods = category.getMenuItems();
                        for (MenuItem menuItem : categoryFoods) {
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

    @Override
    @Transactional
    public ResponseEntity<?> getCurrentCustomerOrders(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Order> orders = orderRepository.findByCustomerOrderByOrderedDateDesc(customer);

        List<CustomerOrderSummaryDTO> currentOrders = new ArrayList<>();

        for (Order order : orders) {
            List<OrderGroup> groups = order.getOrderGroups();
            if (groups == null || groups.isEmpty())
                continue;

            String generalStatus = calculateOrderStatus(groups);
            if (generalStatus.equals("COMPLETED") || generalStatus.equals("REJECTED"))
                continue;

            List<CustomerCurrentOrderDTO> groupDTOs = groups.stream().map(group -> {
                LocalDateTime estimatedDelivery = group.getOrder().getOrderedDate().plusMinutes(40);

                Optional<Address> customerAddress = addressRepository
                        .findById(order.getCustomer().getCurrentAddressId());

                Optional<Address> restaurantAddress = addressRepository.findByRestaurant(group.getRestaurant());
                double customerLat = customerAddress.get().getLatitude();
                double customerLng = customerAddress.get().getLongitude();
                double restLat = restaurantAddress.get().getLatitude();
                double restLng = restaurantAddress.get().getLongitude();

                double distance = calculateHaversine(customerLat, customerLng, restLat, restLng);

                int totalQuantity = group.getOrderItems().stream()
                .mapToInt(item -> item.getQuantity())
                .sum();

                return new CustomerCurrentOrderDTO(
                        group.getId(),
                        group.getRestaurant().getId(),
                        group.getRestaurant().getRestaurantName(),
                        group.getRestaurant().getProfileImg(),
                        totalQuantity,
                        group.getRestaurantTotal(),
                        group.getStatus(),
                        group.getOrder().getOrderedDate(),
                        estimatedDelivery,
                        distance
                );
            }).toList();


            currentOrders.add(new CustomerOrderSummaryDTO(
                    order.getId(),
                    generalStatus,
                    order.getOrderedDate(),
                    groupDTOs));
        }

        return ResponseEntity.ok(currentOrders);
    }

    @Override
    @Transactional
    public ResponseEntity<?> cancelOrder(Long orderGroupId, String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        OrderGroup orderGroup = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Order Group not found"));

        if (!orderGroup.getOrder().getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body("You can only cancel your own orders.");
        }

        if (orderGroup.getDeliveredDate() != null || orderGroup.getRejectionDate() != null
                || orderGroup.getCancelledDate() != null) {
            return ResponseEntity.status(400).body("Order cannot be cancelled.");
        }

        orderGroup.setCancelledDate(LocalDateTime.now());
        orderGroupRepository.save(orderGroup);

        return ResponseEntity.ok("Order cancelled successfully.");
    }

    @Override
    @Transactional
    public OrderDetailsResponse getOrderDetails(String email, Long orderGroupId) {
        OrderGroup orderGroup = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Order Group not found"));

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!orderGroup.getOrder().getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("Unauthorized access");
        }

        Address address = addressRepository.findById(customer.getCurrentAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        List<OrderItemDTO> itemDTOs = orderGroup.getOrderItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getMenuItem().getName(),
                        item.getMenuItemId(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getRemovables()))
                .toList();

        return new OrderDetailsResponse(
                orderGroup.getId(),
                orderGroup.getRestaurant().getRestaurantName(),
                orderGroup.getOrderItems().size(),
                orderGroup.getRestaurantTotal(),
                address.getName(),
                address.getFullAddress(),
                address.getCity(),
                orderGroup.getOrder().getOrderedDate(),
                itemDTOs);
    }

    private String calculateOrderStatus(List<OrderGroup> groups) {
        boolean allDelivered = true;

        for (OrderGroup g : groups) {
            if (g.getRejectionDate() != null)
                return "REJECTED";
            if (g.getDeliveredDate() == null)
                allDelivered = false;
        }

        return allDelivered ? "COMPLETED" : "IN_PROGRESS";
    }

    private static MenuItemCustomerResponse getMenuItemCustomerResponse(Restaurant restaurant, MenuItem menuItem) {
        MenuItemCustomerResponse itemResponse = new MenuItemCustomerResponse();
        itemResponse.setId(menuItem.getId());
        itemResponse.setName(menuItem.getName());
        itemResponse.setPrice(menuItem.getPrice());
        itemResponse.setDescription(menuItem.getDescription());
        itemResponse.setImg(menuItem.getImg());
        itemResponse.setRestaurant(
                new RestaurantResponse(restaurant.getId(), restaurant.getRestaurantName(), null, 0, 0, 0, null));
        return itemResponse;
    }

    @Override
    public ResponseEntity<?> getIngredients(Long menuItemId, String email) {

        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Menu item not found"));

        List<RemovableElementResponse> removableElementResponses = new ArrayList<>();

        for (RemovableElement removableElement : item.getRemovableElements()) {
            RemovableElementResponse response = new RemovableElementResponse(removableElement.getId(),
                    removableElement.getName());
            removableElementResponses.add(response);
        }
        return ResponseEntity.ok(removableElementResponses);
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

    @Override
    @Transactional
    public ResponseEntity<?> getRestaurantById(Long restaurantId) {
        if (restaurantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Restaurant ID is required");
        }

        return restaurantRepository.findById(restaurantId)
                .map(restaurant -> {
                    // Check restaurant status
                    if (!restaurant.getStatus().equals(AccountStatus.APPROVED) ||
                            restaurant.getStatus().equals(AccountStatus.BANNED)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is not available");
                    }

                    // Get menu data and map entities to DTOs
                    List<CategoryResponse> categoryResponses = menuRepository.findByRestaurantId(restaurantId)
                            .map(menu -> menu.getCategories().stream()
                                    .map(category -> {
                                        // Map each menu item in the category
                                        List<MenuItemResponse> menuItemResponses = category.getMenuItems().stream()
                                                .map(item -> {
                                                    // Map removable elements
                                                    List<RemovableElementResponse> removableElementResponses = item
                                                            .getRemovableElements().stream()
                                                            .map(element -> new RemovableElementResponse(
                                                                    element.getId(),
                                                                    element.getName()))
                                                            .collect(Collectors.toList());

                                                    // Create menu item response
                                                    return new MenuItemResponse(
                                                            item.getId(),
                                                            item.getName(),
                                                            item.getPrice(),
                                                            item.getDescription(),
                                                            item.getImg(),
                                                            removableElementResponses);
                                                })
                                                .collect(Collectors.toList());

                                        // Create category response with its menu items
                                        return new CategoryResponse(
                                                category.getId(),
                                                category.getName(),
                                                menuItemResponses);
                                    })
                                    .collect(Collectors.toList()))
                            .orElse(Collections.emptyList());

                    // Create menu response
                    MenuResponse menuResponse = new MenuResponse(
                            restaurantId,
                            restaurant.getRestaurantName(),
                            categoryResponses);

                    // Create and return restaurant response
                    RestaurantResponse response = new RestaurantResponse(
                            restaurant.getId(),
                            restaurant.getRestaurantName(),
                            restaurant.getProfileImg(),
                            4.6, 
                            345, 
                            100, 
                            menuResponse);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found"));
    }

    @Override
    @Transactional
    public ResponseEntity<?> getRestaurantMenu(Long restaurantId) {
        if (restaurantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Restaurant ID is required");
        }

        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Restaurant restaurant = restaurantOpt.get();

        if (!restaurant.getStatus().equals(AccountStatus.APPROVED) ||
                restaurant.getStatus().equals(AccountStatus.BANNED)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is not available");
        }

        Optional<Menu> menuOpt = menuRepository.findByRestaurant(restaurant);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found");
        }

        Menu menu = menuOpt.get();
        List<CategoryResponse> categoryResponses = new ArrayList<>();

        // Process categories and menu items
        for (Category category : menu.getCategories()) {
            List<MenuItemResponse> itemResponses = new ArrayList<>();

            for (MenuItem item : category.getMenuItems()) {
                // Skip unavailable items
                if (!item.getIsAvailable()) {
                    continue;
                }

                // Process removable elements
                List<RemovableElementResponse> removableElementsResponses = new ArrayList<>();
                for (RemovableElement removableElement : item.getRemovableElements()) {
                    removableElementsResponses.add(new RemovableElementResponse(
                            removableElement.getId(),
                            removableElement.getName()));
                }

                // Add menu item to response
                itemResponses.add(new MenuItemResponse(
                        item.getId(),
                        item.getName(),
                        item.getPrice(),
                        item.getDescription(),
                        item.getImg(),
                        removableElementsResponses));
            }

            // Only add categories with available items
            if (!itemResponses.isEmpty()) {
                categoryResponses.add(new CategoryResponse(
                        category.getId(),
                        category.getName(),
                        itemResponses));
            }
        }

        MenuResponse response = new MenuResponse(
                menu.getId(),
                restaurant.getRestaurantName(),
                categoryResponses);

        return ResponseEntity.ok(response);
    }
}