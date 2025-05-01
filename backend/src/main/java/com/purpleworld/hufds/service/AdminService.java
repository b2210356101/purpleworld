package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.CouponRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.dto.response.CourierResponseForAdmin;
import com.purpleworld.hufds.dto.response.RestaurantResponseForAdmin;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AdminService {

    ResponseEntity<?> getStats(String email);

    // Restaurant Management
    ResponseEntity<List<RestaurantResponseForAdmin>> getAllRestaurants();
    ResponseEntity<?> approveRestaurant(Long restaurantId);
    ResponseEntity<?> rejectRestaurant(Long restaurantId);
    ResponseEntity<?> banRestaurant(Long restaurantId);
    ResponseEntity<?> unbanRestaurant(Long restaurantId);

    // Courier Management
    ResponseEntity<List<CourierResponseForAdmin>> getAllCouriers();
    ResponseEntity<?> approveCourier(Long courierId);
    ResponseEntity<?> rejectCourier(Long courierId);
    ResponseEntity<?> banCourier(Long courierId);
    ResponseEntity<?> unbanCourier(Long courierId);

    // Coupon Management
    ResponseEntity<?> createCoupon(CouponRequest request);
    ResponseEntity<?> updateCoupon(Long couponId, CouponRequest request);
    ResponseEntity<?> deleteCoupon(Long couponId);
    ResponseEntity<List<CouponResponse>> getAllCoupons();
}

