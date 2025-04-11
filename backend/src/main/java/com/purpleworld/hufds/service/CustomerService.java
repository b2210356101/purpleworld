package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.AddressRequest;
import org.springframework.http.ResponseEntity;

public interface CustomerService {
    ResponseEntity<String> dashboard();
    ResponseEntity<?> getCustomerAddresses(String email);
    ResponseEntity<?> createAddress(AddressRequest request, String email);
    ResponseEntity<?> setCurrentAddress(Long addressId, String email);
    ResponseEntity<?> getCurrentAddress(String email);
    ResponseEntity<?> getNearestRestaurants(String email);

    ResponseEntity<?> deleteAddress(Long addressId, String email);
}