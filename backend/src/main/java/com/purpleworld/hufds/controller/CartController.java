package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.dto.request.CartGroupNoteRequest;
import com.purpleworld.hufds.dto.request.UpdateCartItemRequest;
import com.purpleworld.hufds.dto.response.AddToCartResponse;
import com.purpleworld.hufds.dto.response.CartAmountResponse;
import com.purpleworld.hufds.dto.response.CartSummaryResponse;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PutMapping("/item")
    public ResponseEntity<String> updateItemQuantity(@RequestBody UpdateCartItemRequest request,
                                                     @AuthenticationPrincipal String email) {
        cartService.updateCartItemQuantity(request, email);
        return ResponseEntity.ok("Quantity updated successfully");
    }

    @PutMapping("/group/{groupId}/note")
    public ResponseEntity<String> updateGroupNote(@RequestBody CartGroupNoteRequest request,
                                                  @PathVariable Long groupId,
                                                  @AuthenticationPrincipal String email) {
        cartService.updateCartGroupNote(request,groupId,email);
        return ResponseEntity.ok("Note updated successfully");

    }

    @GetMapping("/check-amount")
    public ResponseEntity<List<CartAmountResponse>> checkAmount(@AuthenticationPrincipal String email) {
        List<CartAmountResponse> response = cartService.checkCartAmount(email);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/apply-coupon")
    public ResponseEntity<CouponResponse> applyCouponToCart(
            @AuthenticationPrincipal String email,
            @RequestParam String code) {
        return ResponseEntity.ok(cartService.applyCouponToCart(email, code));
    }

    @GetMapping("/summary")
    public CartSummaryResponse getCartSummary(@AuthenticationPrincipal String email) {
        return cartService.getCartSummary(email);
    }


}
