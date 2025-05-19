package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.OrderDetailsResponse;
import com.purpleworld.hufds.dto.request.AddressRequest;
import com.purpleworld.hufds.dto.request.ReviewRequest;
import com.purpleworld.hufds.dto.request.ChangePasswordRequest;
import com.purpleworld.hufds.dto.request.ProfileUpdateRequest;
import com.purpleworld.hufds.service.CustomerService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/dashboard")
    public ResponseEntity<String> dashboard() {
        return customerService.dashboard();
    }

    @GetMapping("/addresses")
    public ResponseEntity<?> getCustomerAddresses(@AuthenticationPrincipal String email) {
        return customerService.getCustomerAddresses(email);
    }

    @PostMapping("/address")
    public ResponseEntity<?> createAddress(@RequestBody AddressRequest request,
                                           @AuthenticationPrincipal String email) {
        return customerService.createAddress(request, email);
    }
    @DeleteMapping("/address")
    public ResponseEntity<?> deleteAddress(@RequestParam Long addressId,
                                           @AuthenticationPrincipal String email) {
        return customerService.deleteAddress(addressId,email);
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(@RequestParam Long addressId,
                                           @RequestBody AddressRequest request,
                                           @AuthenticationPrincipal String email) {
        return customerService.updateAddress(addressId, request, email);
    }

    @PostMapping("/set-current-address")
    public ResponseEntity<?> setCurrentAddress(@RequestParam Long addressId,
                                               @AuthenticationPrincipal String email) {
        return customerService.setCurrentAddress(addressId, email);
    }

    @GetMapping("/current-address")
    public ResponseEntity<?> getCurrentAddress(@AuthenticationPrincipal String email) {
        return customerService.getCurrentAddress(email);
    }



    @GetMapping("/nearest-restaurants")
    public ResponseEntity<?> getNearestRestaurants(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return customerService.getNearestRestaurants(email, pageable);
    }

    @GetMapping("/popular-foods")
    public ResponseEntity<?> getPopularFoods(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return customerService.getNearestRestaurantFood(email, pageable);
    }

    @GetMapping("/{menuItemId}/ingredients")
    public ResponseEntity<?> getIngredients(@AuthenticationPrincipal String email, @PathVariable Long menuItemId) {
        return customerService.getIngredients(menuItemId,email);
    }

    @GetMapping("/orders/current")
    public ResponseEntity<?> getCurrentOrders(@AuthenticationPrincipal String email) {
        return customerService.getCurrentCustomerOrders(email);
    }


    @PostMapping("/orders/{orderGroupId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderGroupId, @AuthenticationPrincipal String email) {
        return customerService.cancelOrder(orderGroupId, email);
    }

    @GetMapping("/order/{orderGroupId}/details")
    public ResponseEntity<OrderDetailsResponse> getOrderDetails(
            @PathVariable Long orderGroupId,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(customerService.getOrderDetails(email, orderGroupId));
    }

    @GetMapping("/restaurants/{restaurantId}")
    public ResponseEntity<?> getRestaurantDetails(@PathVariable Long restaurantId) {
        return customerService.getRestaurantById(restaurantId);
    }

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> getRestaurantMenu(@PathVariable Long restaurantId) {
        return customerService.getRestaurantMenu(restaurantId);
    }

    @PostMapping("/orders/{orderGroupId}/review")
    public ResponseEntity<?> createReview(
            @PathVariable Long orderGroupId,
            @AuthenticationPrincipal String email,
            @RequestBody ReviewRequest request
    ) {
        return customerService.createReview(orderGroupId, email, request);
    }

    @GetMapping("/restaurants/{restaurantId}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long restaurantId, @AuthenticationPrincipal String email) {
        return customerService.restaurantReviews(restaurantId,email);
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@AuthenticationPrincipal String email) {
        return customerService.getFavorites(email);
    }

    @PostMapping("/favorites/{restaurantId}")
    public ResponseEntity<?> addToFavorites(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal String email) {
        return customerService.addToFavorites(restaurantId, email);
    }

    @DeleteMapping("/favorites/{restaurantId}")
    public ResponseEntity<?> removeFromFavorites(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal String email) {
        return customerService.removeFromFavorites(restaurantId, email);
    }

    @GetMapping("/favorites/{restaurantId}")
    public ResponseEntity<?> checkIsFavorite(
        @PathVariable Long restaurantId,
        @AuthenticationPrincipal String email) {
    return customerService.checkIsFavorite(restaurantId, email);
}

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        return customerService.getCustomerProfile(email);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody ProfileUpdateRequest request) {
        return customerService.updateCustomerProfile(email, request);
    }

    @PostMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            // Burada authService içinde password değiştirme mantığını uygulayın
            customerService.changePassword(request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }


    }
}

