package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.OrderDetailsResponse;
import com.purpleworld.hufds.dto.request.AddressRequest;
import org.springframework.http.ResponseEntity;

public interface CustomerService {
    ResponseEntity<String> dashboard();
    ResponseEntity<?> getCustomerAddresses(String email);
    ResponseEntity<?> createAddress(AddressRequest request, String email);
    ResponseEntity<?> setCurrentAddress(Long addressId, String email);
    ResponseEntity<?> getCurrentAddress(String email);
    ResponseEntity<?> getNearestRestaurants(String email);

    ResponseEntity<?> deleteAddress(Long addressId, String email);
    ResponseEntity<?> updateAddress(Long addressId, AddressRequest request, String email);

    ResponseEntity<?> getNearestRestaurantFood(String email);
    ResponseEntity<?> getIngredients(Long menuItemId, String email);

    ResponseEntity<?> getCurrentCustomerOrders(String email);
    ResponseEntity<?> cancelOrder(Long orderGroupId, String email);
    OrderDetailsResponse getOrderDetails(String email, Long orderGroupId);

    ResponseEntity<?> getRestaurantById(Long restaurantId);
    ResponseEntity<?> getRestaurantMenu(Long restaurantId);

}