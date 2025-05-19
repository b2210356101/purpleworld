package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.RestaurantProfileUpdateRequest;
import com.purpleworld.hufds.dto.response.RestaurantProfileResponse;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.service.RestaurantService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl  implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public ResponseEntity<?> getRestaurantProfile(String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            RestaurantProfileResponse response = new RestaurantProfileResponse(
                    restaurant.getId(),
                    restaurant.getRestaurantName(),
                    restaurant.getEmail(),
                    restaurant.getPhoneNumber(),
                    restaurant.getProfileImg(),
                    restaurant.getManagerFirstName(),
                    restaurant.getManagerLastName(),
                    restaurant.getMaxDeliveryDistance(),
                    restaurant.getMinOrderAmount()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateRestaurantProfile(String email, RestaurantProfileUpdateRequest request) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            if (request.getManagerFirstName() != null && !request.getManagerFirstName().isBlank()) {
                restaurant.setManagerFirstName(request.getManagerFirstName());
            }

            if (request.getManagerLastName() != null && !request.getManagerLastName().isBlank()) {
                restaurant.setManagerLastName(request.getManagerLastName());
            }

            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                restaurant.setPhoneNumber(request.getPhoneNumber());
            }

            if (request.getProfileImg() != null) {
                restaurant.setProfileImg(request.getProfileImg());
            }

            if (request.getRestaurantName() != null && !request.getRestaurantName().isBlank()) {
                restaurant.setRestaurantName(request.getRestaurantName());
            }

            if (request.getMaxDeliveryDistance() != null) {
                restaurant.setMaxDeliveryDistance(request.getMaxDeliveryDistance());
            }

            if (request.getMinOrderAmount() != null) {
                restaurant.setMinOrderAmount(request.getMinOrderAmount());
            }

            restaurantRepository.save(restaurant);

            RestaurantProfileResponse response = new RestaurantProfileResponse(
                    restaurant.getId(),
                    restaurant.getRestaurantName(),
                    restaurant.getEmail(),
                    restaurant.getPhoneNumber(),
                    restaurant.getProfileImg(),
                    restaurant.getManagerFirstName(),
                    restaurant.getManagerLastName(),
                    restaurant.getMaxDeliveryDistance(),
                    restaurant.getMinOrderAmount()
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Transactional
    @Override
    public void changePassword(String currentPassword, String newPassword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Optional<Restaurant> restaurantOptional = restaurantRepository.findByEmail(email);
        if (restaurantOptional.isPresent()) {
            Restaurant restaurant = restaurantOptional.get();

            if (!passwordEncoder.matches(currentPassword, restaurant.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }

            restaurant.setPassword(passwordEncoder.encode(newPassword));
            restaurantRepository.save(restaurant);
            return;
        }

        throw new RuntimeException("User not found");
    }

}


