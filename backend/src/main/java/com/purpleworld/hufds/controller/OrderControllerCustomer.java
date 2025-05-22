package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.PlaceOrderRequest;
import com.purpleworld.hufds.dto.response.OrderDTO;
import com.purpleworld.hufds.dto.response.PlaceOrderResponse;
import com.purpleworld.hufds.service.OrderServiceForCustomer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer/order")
@RequiredArgsConstructor
public class OrderControllerCustomer {
    private final OrderServiceForCustomer orderService;

    @PostMapping("/place")
    public ResponseEntity<PlaceOrderResponse> placeOrder(@RequestBody PlaceOrderRequest request,
                                                         @AuthenticationPrincipal String email) {
        PlaceOrderResponse response = orderService.placeOrder(email, request);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/history")
    public ResponseEntity<List<OrderDTO>> getOrderHistory(@AuthenticationPrincipal String email) {
        List<OrderDTO> history = orderService.getCustomerOrderHistory(email);
        return ResponseEntity.ok(history);
    }


}
