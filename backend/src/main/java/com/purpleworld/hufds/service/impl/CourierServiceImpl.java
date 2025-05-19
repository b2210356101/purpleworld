package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.CourierOrderDTO;
import com.purpleworld.hufds.dto.CourierStatsDTO;
import com.purpleworld.hufds.dto.OrderItemDTO;
import com.purpleworld.hufds.dto.request.CourierProfileUpdateRequest;
import com.purpleworld.hufds.dto.response.CourierProfileResponse;
import com.purpleworld.hufds.entity.Address;
import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.OrderGroupRepository;
import com.purpleworld.hufds.service.CourierService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourierServiceImpl implements CourierService {
    private final CourierRepository courierRepository;
    private final OrderGroupRepository orderGroupRepository;
    private final AddressRepository addressRepository;
    private final TrackingServiceImpl trackingServiceImpl;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional
    public List<CourierOrderDTO> getAssignedOrdersForCourier(String email) {
        Courier courier = courierRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        if (courier.getStatus() != AccountStatus.APPROVED) {
            throw new RuntimeException("Courier is not approved to perform this action.");
        }

        List<OrderGroup> assignedOrders = orderGroupRepository.findByCourierId(courier.getId())
                .stream()
                .filter(group -> group.getDeliveredDate() == null) // sadece teslim edilmemiş olanlar
                .collect(Collectors.toList());

        // Kuyruktaki siparişi al
        OrderGroup queuedOrder = courier.getQueuedOrder();

        List<OrderGroup> ordersToReturn = new ArrayList<>(assignedOrders);
        if (queuedOrder != null && ordersToReturn.stream().noneMatch(o -> o.getId().equals(queuedOrder.getId()))) {
            ordersToReturn.add(queuedOrder);
        }

        Optional<OrderGroup> mainOrder = ordersToReturn.stream()
                .filter(o -> o.getPreparedDate() != null)
                .min(Comparator.comparing(OrderGroup::getPreparedDate));

        return ordersToReturn.stream().map(group -> {
            CourierOrderDTO dto = new CourierOrderDTO();
            dto.setOrderGroupId(group.getId());
            dto.setStatus(group.getStatus());
            dto.setOrderedDate(group.getOrder().getOrderedDate());
            dto.setTakenOverDate(group.getTakenOverDate());

            dto.setCustomerId(group.getOrder().getCustomer().getId());
            dto.setCustomerName(group.getOrder().getCustomer().getFirstName() + " " +
                    group.getOrder().getCustomer().getLastName());
            dto.setCustomerPhone(group.getOrder().getCustomer().getPhoneNumber());

            Long addressId = group.getOrder().getCustomer().getCurrentAddressId();
            addressRepository.findById(addressId).ifPresent(addr -> {
                dto.setCustomerLatitude(addr.getLatitude());
                dto.setCustomerLongitude(addr.getLongitude());
                dto.setCustomerFullAddress(addr.getFullAddress());
            });

            dto.setRestaurantName(group.getRestaurant().getRestaurantName());
            Optional<Address> restaurantAddress = addressRepository.findByRestaurant(group.getRestaurant());
            restaurantAddress.ifPresent(addr -> {
                dto.setRestaurantLatitude(addr.getLatitude());
                dto.setRestaurantLongitude(addr.getLongitude());
                dto.setRestaurantPhone(group.getRestaurant().getPhoneNumber());
            });

            dto.setOrderItems(
                    group.getOrderItems().stream().map(item -> new OrderItemDTO(
                                    item.getMenuItem().getName(),
                                    item.getMenuItemId(),
                                    item.getQuantity(),
                                    item.getPrice(),
                                    item.getRemovables()))
                            .collect(Collectors.toList()));

            dto.setMainOrder(mainOrder.map(m -> m.getId().equals(group.getId())).orElse(false));

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void pickedUp(String email, Long orderGroupId) {
        Courier courier = courierRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        if (courier.getStatus() != AccountStatus.APPROVED) {
            throw new RuntimeException("Courier is not approved to perform this action.");
        }

        OrderGroup order = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("OrderGroup not found"));

        if (order.getCourier() == null || !order.getCourier().getId().equals(courier.getId())) {
            throw new RuntimeException("This courier is not assigned to the order.");
        }

        if (order.getTakenOverDate() != null) {
            throw new RuntimeException("Order has already been picked up.");
        }

        order.setTakenOverDate(LocalDateTime.now());
        orderGroupRepository.save(order);

        Optional<Address> restaurantAddress = addressRepository.findByRestaurant(order.getRestaurant());
        Optional<Address> customerAddress = addressRepository.findById(order.getOrder().getCustomer().getCurrentAddressId());

        if (restaurantAddress.isPresent() && customerAddress.isPresent()) {
            double originLat = restaurantAddress.get().getLatitude();
            double originLng = restaurantAddress.get().getLongitude();
            double destLat = customerAddress.get().getLatitude();
            double destLng = customerAddress.get().getLongitude();

            trackingServiceImpl.startTrackingForOrder(
                    courier.getEmail(),
                    order.getId(),
                    originLat, originLng,
                    destLat, destLng
            );

            System.out.println("Kurye teslim aldı ve takip başlatıldı → Sipariş: #" + order.getId());
        } else {
            System.out.println("Adres bilgisi eksik → Takip başlatılamadı → Sipariş: #" + order.getId());
        }
    }

    @Override
    public CourierStatsDTO getCourierStats(String email) {

        Courier courier = courierRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        if (courier.getStatus() != AccountStatus.APPROVED) {
            throw new RuntimeException("Courier is not approved to perform this action.");
        }

        List<OrderGroup> deliveredOrders = orderGroupRepository.findByCourierId(courier.getId())
                .stream()
                .filter(o -> o.getDeliveredDate() != null)
                .toList();

        int totalDelivered = deliveredOrders.size();

        int todayDelivered = (int) deliveredOrders.stream()
                .filter(o -> o.getDeliveredDate().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .count();

        double totalEarnings = totalDelivered * 40.0;

        return new CourierStatsDTO(totalDelivered, todayDelivered, totalEarnings,courier.isWorking());
    }

    @Override
    @Transactional
    public void changeAvailability(String email) {
        Courier courier = courierRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        if (courier.getStatus() != AccountStatus.APPROVED) {
            throw new RuntimeException("Courier is not approved to change availability.");
        }

        boolean newWorkingStatus = !courier.isWorking();
        courier.setWorking(newWorkingStatus);

        if (!newWorkingStatus && courier.getQueuedOrder() != null) {
            OrderGroup queuedOrder = courier.getQueuedOrder();

            queuedOrder.setCourier(null);
            orderGroupRepository.save(queuedOrder);

            courier.setQueuedOrder(null);
        }

        courierRepository.save(courier);

    }

    @Override
    @Transactional
    public void delivered(String email, Long orderGroupId) {
        Courier courier = courierRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        OrderGroup order = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("OrderGroup not found"));

        if (order.getCourier() == null || !order.getCourier().getId().equals(courier.getId())) {
            throw new RuntimeException("This courier is not assigned to the order.");
        }

        if (order.getDeliveredDate() != null) {
            throw new RuntimeException("Order has already been marked as delivered.");
        }

        order.setDeliveredDate(LocalDateTime.now());
        orderGroupRepository.save(order);

        trackingServiceImpl.clearTracking(orderGroupId);

        if (courier.getQueuedOrder() != null) {
            OrderGroup nextOrder = courier.getQueuedOrder();
            nextOrder.setCourier(courier);
            orderGroupRepository.save(nextOrder);

            courier.setQueuedOrder(null);
            courierRepository.save(courier);

            System.out.println("Sıradaki sipariş aktifleştirildi → Sipariş: #" + nextOrder.getId());
        } else {
            courier.setAvailable(true);
            courierRepository.save(courier);
            System.out.println("Kurye tekrar müsait: " + courier.getEmail());
        }

        System.out.println("Sipariş teslim edildi olarak işaretlendi → Sipariş: #" + order.getId());
    }



    @Override
    public ResponseEntity<?> getCourierProfile(String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Courier courier = courierRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Courier not found"));

            CourierProfileResponse response = new CourierProfileResponse(
                    courier.getId(),
                    courier.getFirstName(),
                    courier.getLastName(),
                    courier.getEmail(),
                    courier.getPhoneNumber(),
                    courier.isAvailable(),
                    courier.isWorking()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateCourierProfile(String email, CourierProfileUpdateRequest request) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid or missing token");
            }

            Courier courier = courierRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Courier not found"));

            if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
                courier.setFirstName(request.getFirstName());
            }

            if (request.getLastName() != null && !request.getLastName().isBlank()) {
                courier.setLastName(request.getLastName());
            }

            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                courier.setPhoneNumber(request.getPhoneNumber());
            }

            courierRepository.save(courier);

            CourierProfileResponse response = new CourierProfileResponse(
                    courier.getId(),
                    courier.getFirstName(),
                    courier.getLastName(),
                    courier.getEmail(),
                    courier.getPhoneNumber(),
                    courier.isAvailable(),
                    courier.isWorking()
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body("Error: " + ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }


    @Override
    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();


        Optional<Courier> courierOpt = courierRepository.findByEmail(email);
        if (courierOpt.isPresent()) {
            Courier courier = courierOpt.get();
            if (!passwordEncoder.matches(currentPassword, courier.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            courier.setPassword(passwordEncoder.encode(newPassword));
            courierRepository.save(courier);
            return;
        }


        throw new RuntimeException("User not found");
    }

}