package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.ChangePasswordRequest;
import com.purpleworld.hufds.dto.request.RestaurantProfileUpdateRequest;
import com.purpleworld.hufds.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restaurant/profile")
@RequiredArgsConstructor
public class RestaurantProfileController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        return restaurantService.getRestaurantProfile(email);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody RestaurantProfileUpdateRequest request) {
        return restaurantService.updateRestaurantProfile(email, request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            restaurantService.changePassword(request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }


    }
}