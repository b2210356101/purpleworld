package com.purpleworld.hufds;

import com.purpleworld.hufds.dto.request.CourierRegisterRequest;
import com.purpleworld.hufds.dto.request.CustomerRegisterRequest;
import com.purpleworld.hufds.dto.request.LoginRequest;
import com.purpleworld.hufds.dto.request.RestaurantRegisterRequest;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.exception.LoginException;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.service.AuthService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@Rollback
public class LoginServiceTest {

    @Autowired
    private AuthService authService;
    @Autowired
    private CourierRepository courierRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private CustomerRepository customerRepository;

    @Test
    public void testCustomerLoginSuccessfully() {
        CustomerRegisterRequest registerRequest = new CustomerRegisterRequest();
        registerRequest.setEmail("login_customer@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirst_Name("Login");
        registerRequest.setLast_Name("Customer");
        registerRequest.setPhone_Number("1234567890");

        authService.registerCustomer(registerRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login_customer@example.com");
        loginRequest.setPassword("password123");

        var response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals("Login", response.getUsername());
    }

    @Test
    public void testCourierLoginSuccessfully() {
        CourierRegisterRequest registerRequest = new CourierRegisterRequest();
        registerRequest.setEmail("login_courier@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirst_Name("Login");
        registerRequest.setLast_Name("Courier");
        registerRequest.setPhone_Number("0987654321");
        registerRequest.setSsn("5556667777");

        authService.registerCourier(registerRequest);

        var courier = courierRepository.findByEmail("login_courier@example.com").get();
        courier.setStatus(AccountStatus.APPROVED);
        courierRepository.save(courier);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login_courier@example.com");
        loginRequest.setPassword("password123");

        var response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertEquals("COURIER", response.getRole());
        assertEquals("Login", response.getUsername());
    }

    @Test
    public void testRestaurantLoginSuccessfully() {
        RestaurantRegisterRequest registerRequest = new RestaurantRegisterRequest();
        registerRequest.setEmail("login_restaurant@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setName("Login Restaurant");
        registerRequest.setManager_Name("Manager");
        registerRequest.setManager_Last_Name("Restaurant");
        registerRequest.setPhone_Number("5551113333");
        registerRequest.setTax_Id("7776665554");
        registerRequest.setLatitude(40.0);
        registerRequest.setLongitude(30.0);
        registerRequest.setAddress("Restaurant Address");
        registerRequest.setBuildingNumber("15");
        registerRequest.setApartmentNumber("1");
        registerRequest.setProfile_image("profile.png");

        authService.registerRestaurant(registerRequest);

        var restaurant = restaurantRepository.findByEmail("login_restaurant@example.com").get();
        restaurant.setStatus(AccountStatus.APPROVED);
        restaurantRepository.save(restaurant);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login_restaurant@example.com");
        loginRequest.setPassword("password123");

        var response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertEquals("RESTAURANT", response.getRole());
        assertEquals("Login Restaurant", response.getUsername());
    }

    @Test
    public void testLoginFailsWithWrongEmail() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("Invalid credentials"));
    }

    @Test
    public void testLoginFailsWithWrongPassword() {
        CustomerRegisterRequest registerRequest = new CustomerRegisterRequest();
        registerRequest.setEmail("wrongpass_customer@example.com");
        registerRequest.setPassword("correctpassword");
        registerRequest.setFirst_Name("Wrong");
        registerRequest.setLast_Name("Pass");
        registerRequest.setPhone_Number("1112223333");

        authService.registerCustomer(registerRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("wrongpass_customer@example.com");
        loginRequest.setPassword("wrongpassword");

        Exception exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("Invalid credentials"));
    }

    @Test
    public void testRestaurantLoginFailsWhenPending() {
        RestaurantRegisterRequest request = new RestaurantRegisterRequest();
        request.setEmail("pending_restaurant@example.com");
        request.setPassword("password123");
        request.setName("Pending Restaurant");
        request.setManager_Name("Manager");
        request.setManager_Last_Name("Test");
        request.setPhone_Number("5550001111");
        request.setTax_Id("1111222233");
        request.setLatitude(40.0);
        request.setLongitude(30.0);
        request.setAddress("Pending Address");
        request.setBuildingNumber("1");
        request.setApartmentNumber("2");
        request.setProfile_image("pending.png");

        authService.registerRestaurant(request);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("pending_restaurant@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("pending approval"));
    }

    @Test
    public void testRestaurantLoginFailsWhenBanned() {
        RestaurantRegisterRequest request = new RestaurantRegisterRequest();
        request.setEmail("banned_restaurant@example.com");
        request.setPassword("password123");
        request.setName("Banned Restaurant");
        request.setManager_Name("Banned");
        request.setManager_Last_Name("Manager");
        request.setPhone_Number("9998887777");
        request.setTax_Id("999999999");
        request.setLatitude(40.0);
        request.setLongitude(30.0);
        request.setAddress("Ban Street");
        request.setBuildingNumber("3");
        request.setApartmentNumber("5");
        request.setProfile_image("banned.png");

        authService.registerRestaurant(request);

        var restaurant = restaurantRepository.findByEmail("banned_restaurant@example.com").get();
        restaurant.setStatus(AccountStatus.BANNED);
        restaurantRepository.save(restaurant);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("banned_restaurant@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("banned"));
    }


    @Test
    public void testCourierLoginFailsWhenPending() {
        CourierRegisterRequest request = new CourierRegisterRequest();
        request.setEmail("pending_courier@example.com");
        request.setPassword("password123");
        request.setFirst_Name("Pending");
        request.setLast_Name("Courier");
        request.setPhone_Number("0001112222");
        request.setSsn("1234567890");

        authService.registerCourier(request);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("pending_courier@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("pending approval"));
    }

    @Test
    public void testCourierLoginFailsWhenRejected() {
        CourierRegisterRequest request = new CourierRegisterRequest();
        request.setEmail("rejected_courier@example.com");
        request.setPassword("password123");
        request.setFirst_Name("Rejected");
        request.setLast_Name("Courier");
        request.setPhone_Number("2223334444");
        request.setSsn("9876543210");

        authService.registerCourier(request);

        var courier = courierRepository.findByEmail("rejected_courier@example.com").get();
        courier.setStatus(AccountStatus.REJECTED);
        courierRepository.save(courier);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("rejected_courier@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("rejected"));
    }

    @Test
    public void testCourierLoginFailsWhenBanned() {
        CourierRegisterRequest request = new CourierRegisterRequest();
        request.setEmail("banned_courier@example.com");
        request.setPassword("password123");
        request.setFirst_Name("Banned");
        request.setLast_Name("Courier");
        request.setPhone_Number("5556667777");
        request.setSsn("1112223333");

        authService.registerCourier(request);

        var courier = courierRepository.findByEmail("banned_courier@example.com").get();
        courier.setStatus(AccountStatus.BANNED);
        courierRepository.save(courier);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("banned_courier@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("banned"));
    }

    @Test
    public void testCustomerLoginFailsWhenBanned() {
        CustomerRegisterRequest request = new CustomerRegisterRequest();
        request.setEmail("banned_customer@example.com");
        request.setPassword("password123");
        request.setFirst_Name("Banned");
        request.setLast_Name("Customer");
        request.setPhone_Number("3334445555");

        authService.registerCustomer(request);

        var customer = customerRepository.findByEmail("banned_customer@example.com").get();
        customer.setBanned(true);
        customerRepository.save(customer);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("banned_customer@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("banned"));
    }

    @Test
    public void testRestaurantLoginFailsWhenRejected() {
        RestaurantRegisterRequest registerRequest = new RestaurantRegisterRequest();
        registerRequest.setEmail("rejected_restaurant@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setName("Rejected Restaurant");
        registerRequest.setManager_Name("Manager");
        registerRequest.setManager_Last_Name("Rejected");
        registerRequest.setPhone_Number("5552223333");
        registerRequest.setTax_Id("1112223333");
        registerRequest.setLatitude(40.0);
        registerRequest.setLongitude(30.0);
        registerRequest.setAddress("Some Address");
        registerRequest.setBuildingNumber("10");
        registerRequest.setApartmentNumber("2");
        registerRequest.setProfile_image("image.png");

        var registered = authService.registerRestaurant(registerRequest);

        var restaurant = restaurantRepository.findByEmail("rejected_restaurant@example.com").get();
        restaurant.setStatus(AccountStatus.REJECTED);
        restaurantRepository.save(restaurant);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("rejected_restaurant@example.com");
        loginRequest.setPassword("password123");

        Exception exception = assertThrows(LoginException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("rejected"));
    }
}
