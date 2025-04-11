package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.AddressRequest;
import com.purpleworld.hufds.service.CustomerService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<?> getNearestRestaurants(@AuthenticationPrincipal String email) {
        return customerService.getNearestRestaurants(email);

    }
}