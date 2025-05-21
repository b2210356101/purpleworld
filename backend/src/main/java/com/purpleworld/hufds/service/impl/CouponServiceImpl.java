package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.CouponRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.entity.Coupon;
import com.purpleworld.hufds.repository.CouponRepository;
import com.purpleworld.hufds.service.CouponService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    @Transactional
    public ResponseEntity<?> createCoupon(CouponRequest request) {
        Coupon coupon = new Coupon();
        coupon.setCode(request.getName());
        coupon.setDescription(request.getDescription());
        coupon.setPercent(request.getIsPercent());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMinOrderPrice(request.getMinOrderAmount());
        coupon.setActive(true);
        coupon.setExpiryDate(request.getExpiryDate());

        couponRepository.save(coupon);

        return ResponseEntity.ok("Coupon created successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateCoupon(Long couponId, CouponRequest request) {
        Optional<Coupon> couponOpt = couponRepository.findById(couponId);
        if (couponOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Coupon not found.");
        }

        Coupon coupon = couponOpt.get();
        coupon.setCode(request.getName());
        coupon.setDescription(request.getDescription());
        coupon.setPercent(request.getIsPercent());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMinOrderPrice(request.getMinOrderAmount());
        coupon.setExpiryDate(request.getExpiryDate());

        couponRepository.save(coupon);

        return ResponseEntity.ok("Coupon updated successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteCoupon(Long couponId) {
        Optional<Coupon> couponOpt = couponRepository.findById(couponId);
        if (couponOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Coupon not found.");
        }

        couponRepository.delete(couponOpt.get());
        return ResponseEntity.ok("Coupon deleted successfully.");
    }

    @Override
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();
        List<CouponResponse> responses = coupons.stream().map(coupon -> new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.isPercent(),
                coupon.getDiscountAmount(),
                coupon.getMinOrderPrice(),
                coupon.getExpiryDate(),
                coupon.isActive())).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}