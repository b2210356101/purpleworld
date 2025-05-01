package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.OrderGroupDTO;
import com.purpleworld.hufds.dto.RestaurantStatsDTO;
import com.purpleworld.hufds.service.RestaurantOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurant/orders")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantOrderService restaurantOrderService;

    @GetMapping
    public ResponseEntity<List<OrderGroupDTO>> getRestaurantOrders(@AuthenticationPrincipal String  email) {
        System.out.println(email);
        List<OrderGroupDTO> orders = restaurantOrderService.getOrdersForRestaurant(email);
        return ResponseEntity.ok(orders);
    }
    @GetMapping("/active")
    public ResponseEntity<List<OrderGroupDTO>> getActiveOrdersForRestaurant(@AuthenticationPrincipal String  email) {
        System.out.println(email);
        List<OrderGroupDTO> orders = restaurantOrderService.getActiveOrdersForRestaurant(email);
        return ResponseEntity.ok(orders);
    }


    @PostMapping("/{orderGroupId}/accept")
    public ResponseEntity<Void> acceptOrder(@PathVariable Long orderGroupId,
                                            @AuthenticationPrincipal String email) {
        restaurantOrderService.acceptOrder(email, orderGroupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderGroupId}/reject")
    public ResponseEntity<Void> rejectOrder(@PathVariable Long orderGroupId,
                                            @AuthenticationPrincipal String email) {
        restaurantOrderService.rejectOrder(email, orderGroupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderGroupId}/prepared")
    public ResponseEntity<Void> markOrderAsPrepared(@PathVariable Long orderGroupId,
                                                    @AuthenticationPrincipal String email) {
        restaurantOrderService.markOrderAsPrepared(email, orderGroupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<List<RestaurantStatsDTO>> getStats(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(restaurantOrderService.getStatsForRestaurant(email));
    }
}