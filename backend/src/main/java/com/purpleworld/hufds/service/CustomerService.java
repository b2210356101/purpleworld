package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.OrderDetailsResponse;
import com.purpleworld.hufds.dto.request.AddressRequest;

import java.util.List;

import org.springframework.data.domain.Pageable;
import com.purpleworld.hufds.dto.request.ReviewRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.dto.request.ProfileUpdateRequest;
import org.springframework.http.ResponseEntity;

public interface CustomerService {
    ResponseEntity<String> dashboard();
    ResponseEntity<?> getCustomerAddresses(String email);
    ResponseEntity<?> createAddress(AddressRequest request, String email);
    ResponseEntity<?> setCurrentAddress(Long addressId, String email);
    ResponseEntity<?> getCurrentAddress(String email);
    ResponseEntity<?> getNearestRestaurants(String email, Pageable pageable);
    ResponseEntity<?> getNearestRestaurantFood(String email, Pageable pageable);

    ResponseEntity<?> deleteAddress(Long addressId, String email);
    ResponseEntity<?> updateAddress(Long addressId, AddressRequest request, String email);

    ResponseEntity<?> getIngredients(Long menuItemId, String email);

    ResponseEntity<?> getCurrentCustomerOrders(String email);
    ResponseEntity<?> cancelOrder(Long orderGroupId, String email);
    OrderDetailsResponse getOrderDetails(String email, Long orderGroupId);

    ResponseEntity<?> getRestaurantById(Long restaurantId);
    ResponseEntity<?> getRestaurantMenu(Long restaurantId);

    ResponseEntity<?> createReview(Long orderGroupId, String customerEmail, ReviewRequest reviewRequest);

    ResponseEntity<?> restaurantReviews(Long restaurantId, String email);
    ResponseEntity<?> addToFavorites(Long restaurantId, String email);
    ResponseEntity<?> removeFromFavorites(Long restaurantId, String email);
    ResponseEntity<?> getFavorites(String email);
    ResponseEntity<?> checkIsFavorite(Long restaurantId, String email);

    ResponseEntity<?> getCustomerProfile(String email);
    ResponseEntity<?> updateCustomerProfile(String email, ProfileUpdateRequest request);
    void changePassword(String currentPassword, String newPassword);
    ResponseEntity<List<CouponResponse>> getAllCoupons();


}