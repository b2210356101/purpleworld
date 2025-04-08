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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;

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
    @Transactional
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // try Customer
        var customer = customerRepository.findByEmail(email);
        if (customer.isPresent() && passwordEncoder.matches(password, customer.get().getPassword())) {
            String token = jwtService.generateToken(email, "CUSTOMER");
            return ResponseEntity.ok(new LoginResponse(token, "CUSTOMER",customer.get().getFirstName(),null));
        }

        // try Courier
        var courier = courierRepository.findByEmail(email);
        if (courier.isPresent() && passwordEncoder.matches(password, courier.get().getPassword())) {
            String token = jwtService.generateToken(email, "COURIER");
            return ResponseEntity.ok(new LoginResponse(token, "COURIER",courier.get().getFirstName(),null));
        }

        // try Restaurant
        var restaurant = restaurantRepository.findByEmail(email);
        if (restaurant.isPresent() && passwordEncoder.matches(password, restaurant.get().getPassword())) {
            String token = jwtService.generateToken(email, "RESTAURANT");
            return ResponseEntity.ok(new LoginResponse(token, "RESTAURANT",restaurant.get().getRestaurantName(),restaurant.get().getProfileImg()));
        }

        // try Admin
        var admin = adminRepository.findByEmail(email);
        if (admin.isPresent() && passwordEncoder.matches(password, admin.get().getPassword())) {
            String token = jwtService.generateToken(email, "ADMIN");
            return ResponseEntity.ok(new LoginResponse(token, "ADMIN",admin.get().getFirstName(),null));
        }

        return ResponseEntity.status(401).body(new LoginResponse(null, "Invalid credentials",null,null));
    }
}