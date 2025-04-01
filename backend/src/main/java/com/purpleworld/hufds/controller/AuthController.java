package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.*;
import com.purpleworld.hufds.dto.response.RegisterResponse;
import com.purpleworld.hufds.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/customer")
    public ResponseEntity<RegisterResponse> registerCustomer(@RequestBody CustomerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerCustomer(request));
    }

    @PostMapping("/register/courier")
    public ResponseEntity<RegisterResponse> registerCourier(@RequestBody CourierRegisterRequest request) {
        return ResponseEntity.ok(authService.registerCourier(request));
    }

    @PostMapping("/register/restaurant")
    public ResponseEntity<RegisterResponse> registerRestaurant(@RequestBody RestaurantRegisterRequest request) {
        return ResponseEntity.ok(authService.registerRestaurant(request));
    }
}