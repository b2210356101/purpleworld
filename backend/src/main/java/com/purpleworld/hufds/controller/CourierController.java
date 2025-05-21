package com.purpleworld.hufds.controller;


import com.purpleworld.hufds.dto.CourierOrderDTO;
import com.purpleworld.hufds.dto.CourierStatsDTO;
import com.purpleworld.hufds.dto.request.ChangePasswordRequest;
import com.purpleworld.hufds.dto.request.CourierProfileUpdateRequest;
import com.purpleworld.hufds.service.CourierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courier")
@RequiredArgsConstructor
public class CourierController {

    private final CourierService courierService;

    @GetMapping("/orders")
    public ResponseEntity<List<CourierOrderDTO>> getAssignedOrders(@AuthenticationPrincipal String email) {
        List<CourierOrderDTO> orders = courierService.getAssignedOrdersForCourier(email);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/orders/{orderGroupId}/picked-up")
    public ResponseEntity<?> pickedUp(@AuthenticationPrincipal String email,@PathVariable Long orderGroupId) {
        courierService.pickedUp(email,orderGroupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderGroupId}/delivered")
    public ResponseEntity<?> delivered(@AuthenticationPrincipal String email,@PathVariable Long orderGroupId) {
        courierService.delivered(email,orderGroupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public CourierStatsDTO getCourierStats(@AuthenticationPrincipal String email) {
        return courierService.getCourierStats(email);
    }

    @PostMapping("/availability")
    public ResponseEntity<?> changeAvailability(@AuthenticationPrincipal String email){
        courierService.changeAvailability(email);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        return courierService.getCourierProfile(email);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody CourierProfileUpdateRequest request) {
        return courierService.updateCourierProfile(email, request);
    }

    @PostMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            courierService.changePassword(request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(ex.getMessage());
        }


    }

    @GetMapping("/orders/history")
    public ResponseEntity<List<CourierOrderDTO>> getOrders(@AuthenticationPrincipal String email) {
        List<CourierOrderDTO> orders = courierService.getOrdersForCourier(email);
        return ResponseEntity.ok(orders);
    }
}
