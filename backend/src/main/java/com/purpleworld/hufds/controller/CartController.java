package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.dto.response.AddToCartResponse;
import com.purpleworld.hufds.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<AddToCartResponse> addToCart(@RequestBody AddToCartRequest request,
                                                       @AuthenticationPrincipal String email) {
        AddToCartResponse response = cartService.addToCart(request, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/view")
    public ResponseEntity<?> viewCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(cartService.viewCart(email));
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<String> removeItem(@PathVariable Long itemId,
                                             @AuthenticationPrincipal String email) {
        cartService.removeItemFromCart(itemId, email);
        return ResponseEntity.ok("Item removed from cart successfully");
    }
}
