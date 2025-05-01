package com.purpleworld.hufds;

import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.entity.Order;
import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.RestaurantOrderService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import java.time.LocalDateTime;

import static com.purpleworld.hufds.enums.AccountStatus.APPROVED;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
public class RestaurantOrderServiceTest {

    @Autowired
    private RestaurantOrderService restaurantOrderService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderGroupRepository orderGroupRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    void testAcceptOrderSuccessfully() {
        TestEntities entities = createRestaurantWithOrder();

        restaurantOrderService.acceptOrder(entities.restaurant.getEmail(), entities.orderGroup.getId());

        OrderGroup updatedOrderGroup = orderGroupRepository.findById(entities.orderGroup.getId())
                .orElseThrow(() -> new RuntimeException("OrderGroup not found"));

        assertNotNull(updatedOrderGroup.getPreperationDate(), "Order should have been marked as preperation date.");
    }

    @Test
    void testRejectOrderSuccessfully() {
        TestEntities entities = createRestaurantWithOrder();

        restaurantOrderService.rejectOrder(entities.restaurant.getEmail(), entities.orderGroup.getId());

        OrderGroup updatedOrderGroup = orderGroupRepository.findById(entities.orderGroup.getId())
                .orElseThrow(() -> new RuntimeException("OrderGroup not found"));

        assertNotNull(updatedOrderGroup.getRejectionDate(), "Order should have been marked as rejected.");
    }

    @Test
    void testMarkOrderAsPreparedSuccessfully() {
        TestEntities entities = createRestaurantWithOrder();

        restaurantOrderService.markOrderAsPrepared(entities.restaurant.getEmail(), entities.orderGroup.getId());

        OrderGroup updatedOrderGroup = orderGroupRepository.findById(entities.orderGroup.getId())
                .orElseThrow(() -> new RuntimeException("OrderGroup not found"));

        assertNotNull(updatedOrderGroup.getPreparedDate(), "Order should have been marked as prepared.");
    }

    @Test
    void testGetStatsForRestaurant() {
        TestEntities entities = createRestaurantWithOrder();

        var stats = restaurantOrderService.getStatsForRestaurant(entities.restaurant.getEmail());

        assertFalse(stats.isEmpty(), "Stats should not be empty.");
        assertEquals(4, stats.size(), "Stats should contain 4 items.");
    }

    private TestEntities createRestaurantWithOrder() {
        Restaurant restaurant = new Restaurant();
        restaurant.setEmail("testrestaurant@example.com");
        restaurant.setPassword("encodedpass");
        restaurant.setRestaurantName("OrderTestaurant");
        restaurant.setRole(Role.RESTAURANT);
        restaurant.setPhoneNumber("1234567890");
        restaurant.setManagerFirstName("Manager");
        restaurant.setManagerLastName("Surname");
        restaurant.setTaxId("1112223334");
        restaurantRepository.save(restaurant);

        Customer customer = new Customer();
        customer.setFirstName("Test");
        customer.setLastName("Customer");
        customer.setEmail("testcustomer@example.com");
        customer.setPassword("password");
        customer.setPhoneNumber("1234567890");
        customer.setRole(Role.CUSTOMER);
        customerRepository.save(customer);

        Order order = new Order();
        order.setCustomer(customer);
        order.setPrice(100);
        order.setOrderedDate(LocalDateTime.now());
        orderRepository.save(order);

        OrderGroup group = new OrderGroup();
        group.setOrder(order);
        group.setRestaurant(restaurant);
        group.setRestaurantTotal(100);
        orderGroupRepository.save(group);

        return new TestEntities(restaurant, customer, order, group);
    }

    private static class TestEntities {
        Restaurant restaurant;
        Customer customer;
        Order order;
        OrderGroup orderGroup;

        public TestEntities(Restaurant restaurant, Customer customer, Order order, OrderGroup orderGroup) {
            this.restaurant = restaurant;
            this.customer = customer;
            this.order = order;
            this.orderGroup = orderGroup;
        }
    }
}