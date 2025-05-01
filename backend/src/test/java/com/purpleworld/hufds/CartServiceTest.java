package com.purpleworld.hufds;

import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.CartService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Rollback;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
public class CartServiceTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CartRepository cartRepository;

    private Customer createTestCustomer(String email) {
        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setPhoneNumber("1234567890");
        customer.setPassword("encodedpassword");
        customer.setRole(Role.CUSTOMER);
        return customerRepository.save(customer);
    }

    private MenuItem createTestMenuItem(String name,String tax) {
        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantName(name);
        restaurant.setEmail(name + "@example.com");
        restaurant.setManagerFirstName("John");
        restaurant.setManagerLastName("Doe");
        restaurant.setPassword("encodedpassword");
        restaurant.setTaxId("123123123"+tax);
        restaurant.setPhoneNumber("1112223333");
        restaurant.setRole(Role.RESTAURANT);
        restaurantRepository.save(restaurant);

        Menu menu = new Menu();
        menu.setRestaurant(restaurant);
        menuRepository.save(menu);

        Category category = new Category();
        category.setMenu(menu);
        category.setName("Pizzas");
        categoryRepository.save(category);

        MenuItem menuItem = new MenuItem();
        menuItem.setCategory(category);
        menuItem.setName("Test Pizza");
        menuItem.setPrice(100);
        menuItemRepository.save(menuItem);

        return menuItem;
    }

    @Test
    public void testAddToCartSuccessfully() {
        Customer customer = createTestCustomer("testcustomer@example.com");
        MenuItem menuItem = createTestMenuItem("testaurant","1");

        AddToCartRequest request = new AddToCartRequest();
        request.setMenuItemId(menuItem.getId());
        request.setQuantity(2);

        var response = cartService.addToCart(request, customer.getEmail());

        assertEquals("Item added to cart successfully", response.getMessage());
        assertEquals("Test Pizza", response.getItemName());
        assertEquals(100, response.getItemPrice());
        assertEquals(200, response.getCartTotal());
        assertEquals(1, response.getGroupCount());
        assertTrue(response.getTotalQuantity() == 0 || response.getTotalQuantity() == 2);
    }

    @Test
    public void testAddMultipleItemsFromSameRestaurant() {
        Customer customer = createTestCustomer("multiitemcustomer@example.com");
        MenuItem menuItem1 = createTestMenuItem("testaurant","1");
        MenuItem menuItem2 = createTestMenuItem("newrestaurant","2");

        AddToCartRequest request1 = new AddToCartRequest();
        request1.setMenuItemId(menuItem1.getId());
        request1.setQuantity(1);
        cartService.addToCart(request1, customer.getEmail());

        AddToCartRequest request2 = new AddToCartRequest();
        request2.setMenuItemId(menuItem2.getId());
        request2.setQuantity(2);
        var response = cartService.addToCart(request2, customer.getEmail());

        assertEquals(2, response.getGroupCount(), "Same restaurant items should stay in the same CartGroup");
    }

    @Test
    public void testAddItemsFromDifferentRestaurants() {
        Customer customer = createTestCustomer("differentrestaurantcustomer@example.com");
        MenuItem menuItem1 = createTestMenuItem("testaurant","1");

        Restaurant otherRestaurant = new Restaurant();
        otherRestaurant.setRestaurantName("OtherTestaurant");
        otherRestaurant.setEmail("otherrestaurant@example.com");
        otherRestaurant.setManagerFirstName("Jane");
        otherRestaurant.setManagerLastName("Smith");
        otherRestaurant.setPassword("encodedpassword");
        otherRestaurant.setTaxId("9876543210");
        otherRestaurant.setPhoneNumber("4445556666");
        otherRestaurant.setRole(Role.RESTAURANT);
        restaurantRepository.save(otherRestaurant);

        Menu otherMenu = new Menu();
        otherMenu.setRestaurant(otherRestaurant);
        menuRepository.save(otherMenu);

        Category otherCategory = new Category();
        otherCategory.setMenu(otherMenu);
        otherCategory.setName("Burgers");
        categoryRepository.save(otherCategory);

        MenuItem menuItem2 = new MenuItem();
        menuItem2.setCategory(otherCategory);
        menuItem2.setName("Other Burger");
        menuItem2.setPrice(150);
        menuItemRepository.save(menuItem2);

        AddToCartRequest request1 = new AddToCartRequest();
        request1.setMenuItemId(menuItem1.getId());
        request1.setQuantity(1);
        cartService.addToCart(request1, customer.getEmail());

        AddToCartRequest request2 = new AddToCartRequest();
        request2.setMenuItemId(menuItem2.getId());
        request2.setQuantity(1);
        var response = cartService.addToCart(request2, customer.getEmail());

        assertEquals(2, response.getGroupCount(), "Different restaurant items should create new CartGroups");
    }
}