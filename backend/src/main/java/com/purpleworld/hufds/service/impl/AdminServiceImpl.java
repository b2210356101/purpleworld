package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.AdminStats;
import com.purpleworld.hufds.dto.request.CouponRequest;
import com.purpleworld.hufds.dto.response.CouponResponse;
import com.purpleworld.hufds.dto.response.CourierResponseForAdmin;
import com.purpleworld.hufds.dto.response.RestaurantResponseForAdmin;
import com.purpleworld.hufds.entity.Coupon;
import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.AdminRepository;
import com.purpleworld.hufds.repository.CouponRepository;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.service.AdminService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final RestaurantRepository restaurantRepository;
    private final CourierRepository courierRepository;
    private final CouponRepository couponRepository;

    @Override
    public ResponseEntity<?> getStats(String email) {
        int totalRestaurants = (int) restaurantRepository.count();
        int totalCouriers = (int) courierRepository.count();

        int pendingRestaurants = (int) restaurantRepository.findAll().stream()
                .filter(r -> r.getStatus() == AccountStatus.PENDING)
                .count();

        int pendingCouriers = (int) courierRepository.findAll().stream()
                .filter(c -> c.getStatus() == AccountStatus.PENDING)
                .count();

        int totalPendingApprovals = pendingRestaurants + pendingCouriers;

        List<Coupon> allCoupons = couponRepository.findAll();
        int totalCoupons = allCoupons.size();

        AdminStats stats = new AdminStats(
                totalRestaurants,
                totalCouriers,
                totalPendingApprovals,
                totalCoupons
        );

        return ResponseEntity.ok(stats);
    }

    // Restaurant Management
    @Override
    public ResponseEntity<List<RestaurantResponseForAdmin>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<RestaurantResponseForAdmin> responses = restaurants.stream().map(r ->
                new RestaurantResponseForAdmin(r.getId(), r.getRestaurantName(), r.getEmail(),r.getPhoneNumber(), r.getStatus(), r.getManagerFirstName(), r.getManagerLastName(), r.getTaxId())
        ).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Override
    @Transactional
    public ResponseEntity<?> approveRestaurant(Long restaurantId) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) return ResponseEntity.badRequest().body("Restaurant not found");
        Restaurant restaurant = restaurantOpt.get();
        restaurant.setStatus(AccountStatus.APPROVED);
        restaurantRepository.save(restaurant);
        return ResponseEntity.ok("Restaurant approved.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> rejectRestaurant(Long restaurantId) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) return ResponseEntity.badRequest().body("Restaurant not found");
        Restaurant restaurant = restaurantOpt.get();
        restaurant.setStatus(AccountStatus.REJECTED);
        restaurantRepository.save(restaurant);
        return ResponseEntity.ok("Restaurant rejected.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> banRestaurant(Long restaurantId) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) return ResponseEntity.badRequest().body("Restaurant not found");
        Restaurant restaurant = restaurantOpt.get();
        restaurant.setStatus(AccountStatus.BANNED);
        restaurantRepository.save(restaurant);
        return ResponseEntity.ok("Restaurant banned.");
    }
    @Override
    @Transactional
    public ResponseEntity<?> unbanRestaurant(Long restaurantId) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) return ResponseEntity.badRequest().body("Restaurant not found");

        Restaurant restaurant = restaurantOpt.get();
        restaurant.setStatus(AccountStatus.APPROVED);
        restaurantRepository.save(restaurant);

        return ResponseEntity.ok("Restaurant unbanned successfully.");
    }


    // Courier Management
    @Override
    public ResponseEntity<List<CourierResponseForAdmin>> getAllCouriers() {
        List<Courier> couriers = courierRepository.findAll();
        List<CourierResponseForAdmin> responses = couriers.stream().map(c ->
                new CourierResponseForAdmin(c.getId(), c.getFirstName(),c.getLastName(),c.getEmail(),c.getPhoneNumber(), c.getStatus(), c.getSsn())
        ).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Override
    @Transactional
    public ResponseEntity<?> approveCourier(Long courierId) {
        Optional<Courier> courierOpt = courierRepository.findById(courierId);
        if (courierOpt.isEmpty()) return ResponseEntity.badRequest().body("Courier not found");
        Courier courier = courierOpt.get();
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);
        return ResponseEntity.ok("Courier approved.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> rejectCourier(Long courierId) {
        Optional<Courier> courierOpt = courierRepository.findById(courierId);
        if (courierOpt.isEmpty()) return ResponseEntity.badRequest().body("Courier not found");
        Courier courier = courierOpt.get();
        courier.setStatus(AccountStatus.REJECTED);
        courierRepository.save(courier);
        return ResponseEntity.ok("Courier rejected.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> banCourier(Long courierId) {
        Optional<Courier> courierOpt = courierRepository.findById(courierId);
        if (courierOpt.isEmpty()) return ResponseEntity.badRequest().body("Courier not found");
        Courier courier = courierOpt.get();
        courier.setStatus(AccountStatus.BANNED);
        courierRepository.save(courier);
        return ResponseEntity.ok("Courier banned.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> unbanCourier(Long courierId) {
        Optional<Courier> courierOpt = courierRepository.findById(courierId);
        if (courierOpt.isEmpty()) return ResponseEntity.badRequest().body("Courier not found");

        Courier courier = courierOpt.get();
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        return ResponseEntity.ok("Courier unbanned successfully.");
    }


    // Coupon Management
    @Override
    @Transactional
    public ResponseEntity<?> createCoupon(CouponRequest request) {
        Coupon coupon = new Coupon();
        coupon.setCode(request.getName());
        coupon.setDescription(request.getDescription());
        coupon.setPercent(request.getIsPercent());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMinOrderPrice(request.getMinOrderAmount());
        coupon.setExpiryDate(LocalDate.now().plusMonths(1));
        coupon.setActive(true);
        couponRepository.save(coupon);
        return ResponseEntity.ok("Coupon created successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateCoupon(Long couponId, CouponRequest request) {
        Optional<Coupon> couponOpt = couponRepository.findById(couponId);
        if (couponOpt.isEmpty()) return ResponseEntity.badRequest().body("Coupon not found");
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
        if (couponOpt.isEmpty()) return ResponseEntity.badRequest().body("Coupon not found");
        couponRepository.deleteById(couponId);
        return ResponseEntity.ok("Coupon deleted successfully.");
    }

    @Override
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();
        List<CouponResponse> responses = coupons.stream().map(c ->
                new CouponResponse(
                        c.getId(),
                        c.getCode(),
                        c.getDescription(),
                        c.isPercent(),
                        c.getDiscountAmount(),
                        c.getMinOrderPrice(),
                        c.getExpiryDate(),
                        c.isActive()
                )
        ).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}