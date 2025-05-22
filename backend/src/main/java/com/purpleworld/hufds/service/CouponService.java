package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.CouponRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CouponService {
    ResponseEntity<?> createCoupon(String email,CouponRequest request);
    ResponseEntity<?> updateCoupon(Long couponId, CouponRequest request);
    ResponseEntity<?> deleteCoupon(Long couponId);
    ResponseEntity<List<CouponResponse>> getAllCoupons();
}

