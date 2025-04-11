package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.dto.response.AddToCartResponse;

public interface CartService {
    AddToCartResponse addToCart(AddToCartRequest request,String email);

}
