package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.*;
import com.purpleworld.hufds.dto.response.RegisterResponse;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final CourierRepository courierRepository;
    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public RegisterResponse registerCustomer(CustomerRegisterRequest request) {
        Customer customer = new Customer();
        customer.setEmail(request.getEmail());
        customer.setFirstName(request.getFirst_Name());
        customer.setLastName(request.getLast_Name());
        customer.setPhoneNumber(request.getPhone_Number());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.CUSTOMER);
        customerRepository.save(customer);
        return new RegisterResponse("Customer registered successfully!");
    }

    @Override
    public RegisterResponse registerCourier(CourierRegisterRequest request) {
        Courier courier = new Courier();
        courier.setSsn(request.getSsn());
        courier.setFirstName(request.getFirst_Name());
        courier.setLastName(request.getLast_Name());
        courier.setPhoneNumber(request.getPhone_Number());
        courier.setEmail(request.getEmail());
        courier.setPassword(passwordEncoder.encode(request.getPassword()));
        courier.setRole(Role.COURIER);
        courierRepository.save(courier);
        return new RegisterResponse("Courier registered successfully!");
    }

    @Override
    public RegisterResponse registerRestaurant(RestaurantRegisterRequest request) {
        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantName(request.getName());
        restaurant.setEmail(request.getEmail());
        restaurant.setTaxId(request.getTax_Id());
        restaurant.setManagerFirstName(request.getManager_Name());
        restaurant.setManagerLastName(request.getManager_Last_Name());
        restaurant.setPhoneNumber(request.getPhone_Number());
        restaurant.setAddress(request.getAddress());
        restaurant.setPassword(passwordEncoder.encode(request.getPassword()));
        restaurant.setRole(Role.RESTAURANT);
        restaurantRepository.save(restaurant);
        return new RegisterResponse("Restaurant registered successfully!");
    }
}