package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.AddressRequest;
import com.purpleworld.hufds.dto.response.AddressResponse;
import com.purpleworld.hufds.entity.Address;
import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.service.CustomerService;
import com.purpleworld.hufds.service.GoogleMapsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final GoogleMapsService googleMapsService;

    @Override
    public ResponseEntity<String> dashboard() {
        return ResponseEntity.ok("Welcome, CUSTOMER!");
    }

    @Override
    public ResponseEntity<?> getCustomerAddresses(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Address> addresses = addressRepository.findAllByCustomer(customer);

        if (addresses.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasAddress", false));
        }

        List<AddressResponse> addressResponses = addresses.stream()
                .map(AddressResponse::new)
                .toList();

        return ResponseEntity.ok(Map.of(
                "hasAddress", true,
                "addresses", addressResponses
        ));
    }

    @Override
    public ResponseEntity<?> createAddress(AddressRequest request, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address address = googleMapsService.getAddressFromCoordinates(request.getLatitude(), request.getLongitude());

            address.setCustomer(customer);
            address.setName(request.getName());
            address.setLatitude(request.getLatitude());
            address.setLongitude(request.getLongitude());
            address.setBuildingNumber(request.getBuildingNumber());
            address.setApartmentNumber(request.getApartmentNumber());
            address.setFloor(request.getFloor());
            address.setFullAddress(request.getFullAddress());
            address.setPhoneNumber(request.getPhoneNumber());
            address.setDeliveryNote(request.getDeliveryNote());

            addressRepository.save(address);

            return ResponseEntity.ok("Address saved successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body("Unauthorized: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> setCurrentAddress(Long addressId, String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Address selectedAddress = addressRepository.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            if (!selectedAddress.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body("Forbidden: You can only select your own address");
            }

            customer.setCurrentAddressId(selectedAddress.getId());
            customerRepository.save(customer);

            return ResponseEntity.ok("Current address set successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getCurrentAddress(String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (email == null || email.isBlank()) {
                response.put("error", "Unauthorized: Invalid or missing token");
                return ResponseEntity.status(401).body(response);
            }

            Customer customer = customerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            if (customer.getCurrentAddressId() == null) {
                response.put("error", "No selected address.");
                return ResponseEntity.status(404).body(response);
            }

            response.put("addressId", customer.getCurrentAddressId());
            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {
            response.put("error", "Error: " + ex.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("error", "Something went wrong: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}