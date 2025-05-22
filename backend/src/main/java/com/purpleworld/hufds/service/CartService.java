package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.dto.request.CartGroupNoteRequest;
import com.purpleworld.hufds.dto.request.UpdateCartItemRequest;
import com.purpleworld.hufds.dto.response.*;
import jakarta.transaction.Transactional;

import java.util.List;

public interface CartService {
    AddToCartResponse addToCart(AddToCartRequest request, String email);
    ViewCartResponse viewCart(String email);
    void removeItemFromCart(Long itemId, String email);
    void updateCartItemQuantity( UpdateCartItemRequest request, String email);

    void updateCartGroupNote(CartGroupNoteRequest request, Long groupId, String email);
    List<CartAmountResponse> checkCartAmount(String email);

    CouponResponse applyCouponToCart(String email, String code);
    CartSummaryResponse getCartSummary(String email);
}
