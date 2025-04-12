package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.*;
import com.purpleworld.hufds.dto.response.LoginResponse;
import com.purpleworld.hufds.dto.response.RegisterResponse;
import com.purpleworld.hufds.repository.AdminRepository;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.security.JwtService;
import com.purpleworld.hufds.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    private final CustomerRepository customerRepository;
    private final CourierRepository courierRepository;
    private final RestaurantRepository restaurantRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body(new LoginResponse(null, "Invalid credentials", null, null));
        }
    }
}
