package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.*;
import com.purpleworld.hufds.dto.response.RegisterResponse;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.exception.RegistrationException;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.AuthService;
import com.purpleworld.hufds.service.GoogleMapsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final CourierRepository courierRepository;
    private final GoogleMapsService googleMapsService;
    private final AddressRepository addressRepository;
    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public RegisterResponse registerCustomer(CustomerRegisterRequest request) {

        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RegistrationException("A customer with this email already exists");
        }

        Customer customer = new Customer();
        customer.setEmail(request.getEmail());
        customer.setFirstName(request.getFirst_Name());
        customer.setLastName(request.getLast_Name());
        customer.setPhoneNumber(request.getPhone_Number());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.CUSTOMER);
        customer.setBanned(false);

//        Address address = googleMapsService.getAddressFromCoordinates(request.getLatitude(), request.getLongitude());
//        address.setBuildingNumber(request.getBuildingNumber());
//        address.setApartmentNumber(request.getApartmentNumber());
//        address.setCustomer(customer);
//
//        customerRepository.save(customer);
//        addressRepository.save(address);
//
//        customer.setCurrentAddressId(address.getId().intValue());
        customerRepository.save(customer);

        return new RegisterResponse("Customer registered successfully with address!", true);
    }

    @Override
    public RegisterResponse registerCourier(CourierRegisterRequest request) {
        if (courierRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RegistrationException("A courier with this email already exists");
        }

        if (courierRepository.findBySsn(request.getSsn()).isPresent()) {
            throw new RegistrationException("A courier with this SSN already exists");
        }

        Courier courier = new Courier();
        courier.setSsn(request.getSsn());
        courier.setFirstName(request.getFirst_Name());
        courier.setLastName(request.getLast_Name());
        courier.setPhoneNumber(request.getPhone_Number());
        courier.setEmail(request.getEmail());
        courier.setPassword(passwordEncoder.encode(request.getPassword()));
        courier.setRole(Role.COURIER);

        courierRepository.save(courier);
        return new RegisterResponse("Courier registered successfully!", true);
    }

    @Override
    @Transactional
    public RegisterResponse registerRestaurant(RestaurantRegisterRequest request) {
        if (restaurantRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RegistrationException("A restaurant with this email already exists");
        }

        if (restaurantRepository.findByTaxId(request.getTax_Id()).isPresent()) {
            throw new RegistrationException("A restaurant with this Tax ID already exists");
        }

        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantName(request.getName());
        restaurant.setEmail(request.getEmail());
        restaurant.setTaxId(request.getTax_Id());
        restaurant.setManagerFirstName(request.getManager_Name());
        restaurant.setManagerLastName(request.getManager_Last_Name());
        restaurant.setPhoneNumber(request.getPhone_Number());
        restaurant.setProfileImg(request.getProfile_image());
        restaurant.setPassword(passwordEncoder.encode(request.getPassword()));
        restaurant.setRole(Role.RESTAURANT);

        Address address = googleMapsService.getAddressFromCoordinates(request.getLatitude(), request.getLongitude());
        address.setName(request.getName());
        address.setBuildingNumber(request.getBuildingNumber());
        address.setApartmentNumber(request.getApartmentNumber());
        address.setRestaurant(restaurant);
        address.setPhoneNumber(request.getPhone_Number());
        address.setFullAddress(request.getAddress());
        address.setFloor("1");


        restaurantRepository.save(restaurant);
        addressRepository.save(address);

        return new RegisterResponse("Restaurant registered successfully!", true);
    }
}