package com.purpleworld.hufds.service;

import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.OrderGroupRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CourierAssignmentScheduler {

    private final OrderGroupRepository orderGroupRepository;
    private final CourierRepository courierRepository;
    private final AddressRepository addressRepository;
    private final TrackingService trackingService;

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void assignCouriersToReadyOrders() {
        List<OrderGroup> readyOrders = orderGroupRepository.findAllByPreparedDateIsNotNullAndTakenOverDateIsNull();

        for (OrderGroup order : readyOrders) {

            if (order.getRestaurant() == null || order.getRestaurant().getStatus() != AccountStatus.APPROVED) {
                System.out.println(" Restoran onaylı değil, sipariş atlanıyor → Sipariş: #" + order.getId());
                continue;
            }
            if (order.getCourier() != null || courierRepository.existsByQueuedOrder(order)) continue;

            List<Courier> availableCouriers = courierRepository.findAllByIsAvailableTrueAndIsWorkingTrue();
            if (!availableCouriers.isEmpty()) {
                Collections.shuffle(availableCouriers);
                Courier courier = availableCouriers.get(0);

                order.setCourier(courier);
                orderGroupRepository.save(order);

                courier.setAvailable(false);
                courierRepository.save(courier);

                System.out.println("🎯 Kurye RANDOM atandı, sipariş hazır → Sipariş: #" + order.getId());
                continue;
            }

            List<Courier> busyCouriers = courierRepository.findAllByIsAvailableFalseAndIsWorkingTrue();
            List<Courier> eligibleForQueue = busyCouriers.stream()
                    .filter(courier -> courier.getQueuedOrder() == null)
                    .toList();

            if (!eligibleForQueue.isEmpty()) {
                Collections.shuffle(eligibleForQueue);
                Courier courier = eligibleForQueue.get(0);

                order.setCourier(courier);
                orderGroupRepository.save(order);

                courier.setQueuedOrder(order);
                courierRepository.save(courier);

                System.out.println("⏳ Kurye MEŞGUL, sipariş sıraya alındı → Sipariş: #" + order.getId());
            }
        }
    }
}