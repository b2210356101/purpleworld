package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.RestaurantProfileUpdateRequest;
import org.springframework.http.ResponseEntity;

public interface RestaurantService {
    ResponseEntity<?> getRestaurantProfile(String email);
    ResponseEntity<?> updateRestaurantProfile(String email, RestaurantProfileUpdateRequest request);
    void changePassword(String currentPassword, String newPassword);
}