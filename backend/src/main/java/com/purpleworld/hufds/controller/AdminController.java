package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.response.CourierResponseForAdmin;
import com.purpleworld.hufds.dto.response.RestaurantResponseForAdmin;
import com.purpleworld.hufds.dto.response.ReviewResponseForAdmin;
import com.purpleworld.hufds.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    // --- RESTAURANT MANAGEMENT ---

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponseForAdmin>> getAllRestaurants() {
        return adminService.getAllRestaurants();
    }

    @PostMapping("/restaurant/approve/{restaurantId}")
    public ResponseEntity<?> approveRestaurant(@PathVariable Long restaurantId) {
        return adminService.approveRestaurant(restaurantId);
    }

    @PostMapping("/restaurant/reject/{restaurantId}")
    public ResponseEntity<?> rejectRestaurant(@PathVariable Long restaurantId) {
        return adminService.rejectRestaurant(restaurantId);
    }

    @PostMapping("/restaurant/ban/{restaurantId}")
    public ResponseEntity<?> banRestaurant(@PathVariable Long restaurantId) {
        return adminService.banRestaurant(restaurantId);
    }

    @PostMapping("/restaurant/unban/{restaurantId}")
    public ResponseEntity<?> unbanRestaurant(@PathVariable Long restaurantId) {
        return adminService.unbanRestaurant(restaurantId);
    }

    // --- COURIER MANAGEMENT ---

    @GetMapping("/couriers")
    public ResponseEntity<List<CourierResponseForAdmin>> getAllCouriers() {
        return adminService.getAllCouriers();
    }

    @PostMapping("/courier/approve/{courierId}")
    public ResponseEntity<?> approveCourier(@PathVariable Long courierId) {
        return adminService.approveCourier(courierId);
    }

    @PostMapping("/courier/reject/{courierId}")
    public ResponseEntity<?> rejectCourier(@PathVariable Long courierId) {
        return adminService.rejectCourier(courierId);
    }

    @PostMapping("/courier/ban/{courierId}")
    public ResponseEntity<?> banCourier(@PathVariable Long courierId) {
        return adminService.banCourier(courierId);
    }

    @PostMapping("/courier/unban/{courierId}")
    public ResponseEntity<?> unbanCourier(@PathVariable Long courierId) {
        return adminService.unbanCourier(courierId);
    }

    // REVIEW MANAGEMENT

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponseForAdmin>> getAllReviews() {
        return adminService.getAllReviews();
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        return adminService.deleteReview(reviewId);
    }

    @DeleteMapping("/reviews/{reviewId}/reply")
    public ResponseEntity<?> deleteRestaurantReply(@PathVariable Long reviewId) {
        return adminService.deleteRestaurantReply(reviewId);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal String email){
        return adminService.getStats(email);
    }
}
