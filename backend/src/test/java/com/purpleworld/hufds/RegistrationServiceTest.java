package com.purpleworld.hufds;

import com.purpleworld.hufds.dto.request.CustomerRegisterRequest;
import com.purpleworld.hufds.dto.request.CourierRegisterRequest;
import com.purpleworld.hufds.dto.request.RestaurantRegisterRequest;
import com.purpleworld.hufds.exception.RegistrationException;
import com.purpleworld.hufds.service.AuthService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
public class RegistrationServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    public void testCustomerRegistration() {
        CustomerRegisterRequest request = new CustomerRegisterRequest();
        request.setEmail("customernew@example.com");
        request.setPassword("password123");
        request.setFirst_Name("John");
        request.setLast_Name("Doe");
        request.setPhone_Number("1234567890");

        var response = authService.registerCustomer(request);

        assertTrue(response.isSuccess());
        assertEquals("Customer registered successfully with address!", response.getMessage());
    }

    @Test
    public void testCourierRegistration() {
        CourierRegisterRequest request = new CourierRegisterRequest();
        request.setEmail("couriernew@example.com");
        request.setPassword("password123");
        request.setFirst_Name("Jane");
        request.setLast_Name("Smith");
        request.setPhone_Number("0987654321");
        request.setSsn("1234567899");

        var response = authService.registerCourier(request);

        assertTrue(response.isSuccess());
        assertEquals("Courier registered successfully!", response.getMessage());
    }

    @Test
    public void testRestaurantRegistration() {
        RestaurantRegisterRequest request = new RestaurantRegisterRequest();
        request.setEmail("restaurantnew@example.com");
        request.setPassword("password123");
        request.setName("Best Restaurant");
        request.setManager_Name("Alice");
        request.setManager_Last_Name("Johnson");
        request.setPhone_Number("1112223333");
        request.setTax_Id("1234567892");
        request.setLatitude(39.92077);
        request.setLongitude(32.85411);
        request.setAddress("Sample Address");
        request.setBuildingNumber("10");
        request.setApartmentNumber("5");
        request.setProfile_image("profile.png");

        var response = authService.registerRestaurant(request);

        assertTrue(response.isSuccess());
        assertEquals("Restaurant registered successfully!", response.getMessage());
    }

    @Test
    public void testDuplicateCustomerRegistrationFails() {
        CustomerRegisterRequest request = new CustomerRegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setPassword("password123");
        request.setFirst_Name("John");
        request.setLast_Name("Doe");
        request.setPhone_Number("1234567890");

        authService.registerCustomer(request);

        assertThrows(RegistrationException.class, () -> authService.registerCustomer(request));
    }

    @Test
    public void testDuplicateCourierSsnRegistrationFails() {
        CourierRegisterRequest request = new CourierRegisterRequest();
        request.setEmail("couriernew2@example.com");
        request.setPassword("password123");
        request.setFirst_Name("Jane");
        request.setLast_Name("Smith");
        request.setPhone_Number("0987654321");
        request.setSsn("9876543211");

        authService.registerCourier(request);

        assertThrows(RegistrationException.class, () -> authService.registerCourier(request));
    }

    @Test
    public void testDuplicateRestaurantTaxIdRegistrationFails() {
        RestaurantRegisterRequest request = new RestaurantRegisterRequest();
        request.setEmail("restaurantnew2@example.com");
        request.setPassword("password123");
        request.setName("Another Restaurant");
        request.setManager_Name("Bob");
        request.setManager_Last_Name("Brown");
        request.setPhone_Number("5556667777");
        request.setTax_Id("1236543210");
        request.setLatitude(40.0);
        request.setLongitude(30.0);
        request.setAddress("Another Address");
        request.setBuildingNumber("20");
        request.setApartmentNumber("2");
        request.setProfile_image("profile2.png");

        authService.registerRestaurant(request);

        assertThrows(RegistrationException.class, () -> authService.registerRestaurant(request));
    }

}