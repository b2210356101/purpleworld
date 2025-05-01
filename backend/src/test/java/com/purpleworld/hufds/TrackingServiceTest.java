package com.purpleworld.hufds;

import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.TrackingService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
public class TrackingServiceTest {

    @Autowired
    private TrackingService trackingService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderGroupRepository orderGroupRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Test
    public void testStartTrackingForOrder() {
        Customer customer = new Customer();
        customer.setEmail("tracktest@example.com");
        customer.setFirstName("Track");
        customer.setLastName("User");
        customer.setPhoneNumber("1234567890");
        customer.setPassword("encoded");
        customerRepository.save(customer);

        Address addr = new Address();
        addr.setLatitude(39.92077);
        addr.setLongitude(32.85411);
        addr.setFullAddress("Test Address");
        addr.setApartmentNumber("1");
        addr.setBuildingNumber("1");
        addr.setFloor("1");
        addr.setName("Test Address");
        addr.setPhoneNumber("5555555555");

        addressRepository.save(addr);
        customer.setCurrentAddressId(addr.getId());
        customerRepository.save(customer);

        Order order = new Order();
        order.setCustomer(customer);
        order.setAddressId(addr.getId());
        orderRepository.save(order);

        OrderGroup group = new OrderGroup();
        group.setOrder(order);
        orderGroupRepository.save(group);

        trackingService.startTrackingForOrder(
                customer.getEmail(),
                group.getId(),
                39.92077, 32.85411,
                39.0082, 32.9784
        );

        var route = trackingService.getFullRoute(customer.getEmail(), group.getId());

        assertNotNull(route);
        assertFalse(route.isEmpty());
    }

    @Test
    public void testGetNextPoint() throws InterruptedException {
        Customer customer = new Customer();
        customer.setEmail("nextpoint@example.com");
        customer.setFirstName("Next");
        customer.setLastName("Point");
        customer.setPhoneNumber("1234567890");
        customer.setPassword("encoded");
        customerRepository.save(customer);

        Address addr = new Address();
        addr.setLatitude(39.92077);
        addr.setLongitude(32.85411);
        addr.setFullAddress("Another Test Address");
        addr.setApartmentNumber("1");
        addr.setBuildingNumber("1");
        addr.setFloor("1");
        addr.setName("Another Address");
        addr.setPhoneNumber("5555555555");

        addressRepository.save(addr);
        customer.setCurrentAddressId(addr.getId());
        customerRepository.save(customer);

        Order order = new Order();
        order.setCustomer(customer);
        order.setAddressId(addr.getId());
        orderRepository.save(order);

        OrderGroup group = new OrderGroup();
        group.setOrder(order);
        orderGroupRepository.save(group);

        trackingService.startTrackingForOrder(
                customer.getEmail(),
                group.getId(),
                39.92077, 32.85411,
                39.0082, 32.9784
        );

        var firstPoint = trackingService.getNextLocation(customer.getEmail(), group.getId());
        assertNotNull(firstPoint, "First route point should not be null");

        Thread.sleep(3000);

        var secondPoint = trackingService.getNextLocation(customer.getEmail(), group.getId());
        assertNotNull(secondPoint, "Second route point should not be null");
        assertNotEquals(firstPoint, secondPoint, "Second point should be different from the first");
    }
}