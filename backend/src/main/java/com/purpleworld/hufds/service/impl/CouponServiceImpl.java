package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.CouponRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.entity.Admin;
import com.purpleworld.hufds.entity.Coupon;
import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.repository.AdminRepository;
import com.purpleworld.hufds.repository.CouponRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
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
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;

    @Override
    @Transactional
    public ResponseEntity<?> createCoupon(String email,CouponRequest request) {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (couponRepository.existsByCode(request.getCode())) {
            return ResponseEntity.badRequest().body("Coupon code already exists.");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode());
        coupon.setDescription(request.getDescription());
        coupon.setPercent(request.getIsPercent());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMinOrderPrice(request.getMinOrderPrice());
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
        coupon.setCode(request.getCode());
        coupon.setDescription(request.getDescription());
        coupon.setPercent(request.getIsPercent());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMinOrderPrice(request.getMinOrderPrice());
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