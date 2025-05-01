package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.CouponRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @PostMapping("/create")
    public ResponseEntity<?> createCoupon(@RequestBody CouponRequest request) {
        return couponService.createCoupon(request);
    }

    @PutMapping("/update/{couponId}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long couponId, @RequestBody CouponRequest request) {
        return couponService.updateCoupon(couponId, request);
    }

    @DeleteMapping("/delete/{couponId}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long couponId) {
        return couponService.deleteCoupon(couponId);
    }

    @GetMapping("/list")
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return couponService.getAllCoupons();
    }
}
