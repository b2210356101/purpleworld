package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.*;
import com.purpleworld.hufds.dto.response.LoginResponse;
import com.purpleworld.hufds.dto.response.RegisterResponse;


public interface AuthService {
    RegisterResponse registerCustomer(CustomerRegisterRequest request);
    RegisterResponse registerCourier(CourierRegisterRequest request);
    RegisterResponse registerRestaurant(RestaurantRegisterRequest request);
    LoginResponse login(LoginRequest request);

}