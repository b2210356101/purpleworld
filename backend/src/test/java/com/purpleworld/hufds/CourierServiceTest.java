package com.purpleworld.hufds;

import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.Order;
import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.CourierService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
public class CourierServiceTest {

    @Autowired
    private CourierService courierService;

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderGroupRepository orderGroupRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Test
    public void testChangeAvailability() {
        Courier courier = new Courier();
        courier.setEmail("courier1@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Test");
        courier.setLastName("Courier");
        courier.setPhoneNumber("1234567890");
        courier.setSsn("12345678901");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        courierService.changeAvailability(courier.getEmail());
        Courier updated = courierRepository.findByEmail(courier.getEmail()).get();
        assertFalse(updated.isWorking());

        courierService.changeAvailability(courier.getEmail());
        updated = courierRepository.findByEmail(courier.getEmail()).get();
        assertTrue(updated.isWorking());
    }

    @Test
    public void testGetCourierStats() {
        Courier courier = new Courier();
        courier.setEmail("statscourier@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Stat");
        courier.setLastName("Courier");
        courier.setPhoneNumber("1112223333");
        courier.setSsn("11223344556");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        var stats = courierService.getCourierStats(courier.getEmail());

        assertTrue(stats.getTotalDeliveries() >= 0);
        assertTrue(stats.getTodayDeliveries() >= 0);
        assertTrue(stats.getTotalEarnings() >= 0);
    }

    @Test
    public void testPickedUpWithoutOrderFails() {
        Courier courier = new Courier();
        courier.setEmail("pickupfail@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Fail");
        courier.setLastName("Courier");
        courier.setPhoneNumber("2223334444");
        courier.setSsn("22334455667");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        Long fakeOrderGroupId = 999L;

        Exception exception = assertThrows(RuntimeException.class, () -> {
            courierService.pickedUp(courier.getEmail(), fakeOrderGroupId);
        });

        org.junit.jupiter.api.Assertions.assertTrue(exception.getMessage().contains("OrderGroup not found"));
    }

    @Test
    public void testDeliveredWithoutAssignmentFails() {
        Courier courier = new Courier();
        courier.setEmail("deliverfail@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Deliver");
        courier.setLastName("Fail");
        courier.setPhoneNumber("3334445555");
        courier.setSsn("33445566778");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        Long fakeOrderGroupId = 1000L;

        Exception exception = assertThrows(RuntimeException.class, () -> {
            courierService.delivered(courier.getEmail(), fakeOrderGroupId);
        });

        org.junit.jupiter.api.Assertions.assertTrue(exception.getMessage().contains("OrderGroup not found"));
    }


    @Test
    public void testPickedUpFailsIfCourierNotAssigned() {
        Courier courier = new Courier();
        courier.setEmail("unassigned@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Unassigned");
        courier.setLastName("Courier");
        courier.setPhoneNumber("0000000000");
        courier.setSsn("00000000001");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        Order order = new Order();
        orderRepository.save(order);

        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setOrder(order);
        orderGroupRepository.save(orderGroup);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            courierService.pickedUp(courier.getEmail(), orderGroup.getId());
        });

        assertTrue(exception.getMessage().contains("This courier is not assigned to the order."));
    }

    @Test
    public void testPickedUpFailsIfAlreadyTaken() {
        Courier courier = new Courier();
        courier.setEmail("alreadytaken@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Already");
        courier.setLastName("Taken");
        courier.setPhoneNumber("0000000001");
        courier.setSsn("00000000002");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        Order order = new Order();
        orderRepository.save(order);

        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setOrder(order);
        orderGroup.setCourier(courier);
        orderGroup.setTakenOverDate(java.time.LocalDateTime.now()); // Sipariş alınmış gibi işaretle
        orderGroupRepository.save(orderGroup);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            courierService.pickedUp(courier.getEmail(), orderGroup.getId());
        });

        assertTrue(exception.getMessage().contains("Order has already been picked up."));
    }

    @Test
    public void testDeliveredFailsIfDifferentCourier() {
        Courier courierA = new Courier();
        courierA.setEmail("courierA@example.com");
        courierA.setPassword("pass");
        courierA.setWorking(true);
        courierA.setFirstName("A");
        courierA.setLastName("Courier");
        courierA.setPhoneNumber("1234567891");
        courierA.setSsn("11111111111");
        courierA.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courierA);

        Courier courierB = new Courier();
        courierB.setEmail("courierB@example.com");
        courierB.setPassword("pass");
        courierB.setWorking(true);
        courierB.setFirstName("B");
        courierB.setLastName("Courier");
        courierB.setPhoneNumber("1234567892");
        courierB.setSsn("22222222222");
        courierB.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courierB);

        Order order = new Order();
        orderRepository.save(order);

        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setOrder(order);
        orderGroup.setCourier(courierA);
        orderGroupRepository.save(orderGroup);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            courierService.delivered(courierB.getEmail(), orderGroup.getId());
        });

        assertTrue(exception.getMessage().contains("This courier is not assigned to the order."));
    }

    @Test
    public void testDeliveredFailsIfAlreadyDelivered() {
        Courier courier = new Courier();
        courier.setEmail("alreadydelivered@example.com");
        courier.setPassword("pass");
        courier.setWorking(true);
        courier.setFirstName("Delivered");
        courier.setLastName("Courier");
        courier.setPhoneNumber("9876543210");
        courier.setSsn("33333333333");
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        Order order = new Order();
        orderRepository.save(order);

        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setOrder(order);
        orderGroup.setCourier(courier);
        orderGroup.setDeliveredDate(java.time.LocalDateTime.now()); // Zaten teslim edilmiş
        orderGroupRepository.save(orderGroup);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            courierService.delivered(courier.getEmail(), orderGroup.getId());
        });

        assertTrue(exception.getMessage().contains("Order has already been marked as delivered."));
    }




}
