package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.*;
import com.purpleworld.hufds.dto.response.LoginResponse;
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = authService.isEmailRegistered(email);
        return ResponseEntity.ok(exists);
    }
    @GetMapping("/check-ssn")
    public ResponseEntity<Boolean> checkSsnExists(@RequestParam String ssn) {
        return ResponseEntity.ok(authService.isSsnRegistered(ssn));
    }

    @GetMapping("/check-tax-id")
    public ResponseEntity<Boolean> checkTaxIdExists(@RequestParam String taxId) {
        return ResponseEntity.ok(authService.isTaxIdRegistered(taxId));
    }


}