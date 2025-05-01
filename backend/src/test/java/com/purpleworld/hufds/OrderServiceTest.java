package com.purpleworld.hufds;

import com.purpleworld.hufds.dto.request.PlaceOrderRequest;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.impl.OrderServiceImplCustomer;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Rollback
@Transactional
public class OrderServiceTest {

    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartGroupRepository cartGroupRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderServiceImplCustomer orderService;

    private Customer customer;
    private Restaurant restaurant;
    @Autowired
    private MenuRepository menuRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    public void setUp() {
        customer = new Customer();
        customer.setEmail("customer1@example.com");
        customer.setFirstName("Test");
        customer.setLastName("User");
        customer.setPassword("password");
        customer.setPhoneNumber("1234567890");
        customerRepository.save(customer);

        restaurant = new Restaurant();
        restaurant.setRestaurantName("Test Restaurant");
        restaurant.setEmail("restaurant1@example.com");
        restaurant.setPassword("password");
        restaurant.setPhoneNumber("1234567890");
        restaurant.setManagerFirstName("John");
        restaurant.setManagerLastName("Smith");
        restaurantRepository.save(restaurant);

        Cart cart = new Cart();
        cart.setCustomer(customer);
        cart.setCartGroups(new ArrayList<>()); // EKLENDİ
        cartRepository.save(cart);

        CartGroup cartGroup = new CartGroup();
        cartGroup.setCart(cart);
        cartGroup.setRestaurant(restaurant);
        cartGroup.setCartItems(new ArrayList<>());
        cartGroupRepository.save(cartGroup);

        cart.getCartGroups().add(cartGroup);
        cartRepository.save(cart);

        Menu menu = new Menu();
        menu.setRestaurant(restaurant);
        menuRepository.save(menu);

        Category category = new Category();
        category.setName("Test Category");
        category.setMenu(menu);
        category.setMenuItems(new ArrayList<>());
        categoryRepository.save(category);

        MenuItem menuItem = new MenuItem();
        menuItem.setCategory(category);
        menuItem.setName("Test Food");
        menuItem.setPrice(100);
        menuItemRepository.save(menuItem);

        CartItem cartItem = new CartItem();
        cartItem.setCartGroup(cartGroup);
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(2);

        cartGroup.getCartItems().add(cartItem);
        cartGroupRepository.save(cartGroup);
    }

    @Test
    public void testPlaceOrder() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setPaymentType("cash");

        var response = orderService.placeOrder(customer.getEmail(), request);

        assertNotNull(response);
        assertNotNull(response.getOrderId());
        assertEquals("cash", response.getPaymentType());
        assertTrue(response.getTotalPrice() > 0);

        List<Order> orders = orderRepository.findByCustomerOrderByOrderedDateDesc(customer);
        assertFalse(orders.isEmpty(), "Order should be created");
    }

    @Test
    public void testGetCustomerOrderHistory() {
        // Önce bir sipariş verelim
        testPlaceOrder();

        var history = orderService.getCustomerOrderHistory(customer.getEmail());

        assertNotNull(history);
        assertFalse(history.isEmpty(), "Order history should not be empty");
        assertEquals(1, history.size());
        assertEquals("ORDERED", history.get(0).getStatus());
    }
}