package com.purpleworld.hufds;

import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.repository.CourierRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
public class AdminServiceTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CourierRepository courierRepository;
    @Autowired
    private AddressRepository addressRepository;


    private Restaurant createTestRestaurant(String name, String email) {
        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantName(name);
        restaurant.setEmail(email);
        restaurant.setManagerFirstName("Alice");
        restaurant.setManagerLastName("Smith");
        restaurant.setPassword("password");
        restaurant.setPhoneNumber("1234567890");
        restaurant.setTaxId("1111111111");
        restaurant.setRole(Role.RESTAURANT);
        restaurant.setStatus(AccountStatus.PENDING);
        return restaurantRepository.save(restaurant);
    }

    private Courier createTestCourier(String email) {
        Courier courier = new Courier();
        courier.setFirstName("Bob");
        courier.setLastName("Johnson");
        courier.setEmail(email);
        courier.setPhoneNumber("9876543210");
        courier.setPassword("password");
        courier.setSsn("12345678901");
        courier.setRole(Role.COURIER);
        courier.setStatus(AccountStatus.PENDING);
        return courierRepository.save(courier);
    }

    // ---------- RESTAURANT TESTS ----------

    @Test
    public void testApproveRestaurant() {
        Restaurant restaurant = createTestRestaurant("MyPlace", "myplace@example.com");
        var response = adminService.approveRestaurant(restaurant.getId());
        assertEquals("Restaurant approved.", response.getBody());
        assertEquals(AccountStatus.APPROVED, restaurantRepository.findById(restaurant.getId()).get().getStatus());
    }

    @Test
    public void testBanAndUnbanRestaurant() {
        Restaurant restaurant = createTestRestaurant("BanPlace", "ban@example.com");
        adminService.banRestaurant(restaurant.getId());
        assertEquals(AccountStatus.BANNED, restaurantRepository.findById(restaurant.getId()).get().getStatus());

        adminService.unbanRestaurant(restaurant.getId());
        assertEquals(AccountStatus.APPROVED, restaurantRepository.findById(restaurant.getId()).get().getStatus());
    }

    @Test
    public void testGetAllRestaurants_containsCreated() {
        Restaurant r1 = createTestRestaurant("Testaurant1", "r1@example.com");
        Restaurant r2 = createTestRestaurant("Testaurant2", "r2@example.com");

        var response = adminService.getAllRestaurants();

        var restaurants = response.getBody();
        assertNotNull(restaurants);
        assertTrue(restaurants.stream().anyMatch(r -> r.getEmail().equals("r1@example.com")));
        assertTrue(restaurants.stream().anyMatch(r -> r.getEmail().equals("r2@example.com")));
    }

    @Test
    public void testApproveRestaurant_invalidId() {
        var response = adminService.approveRestaurant(99999L);
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Restaurant not found", response.getBody());
    }

    // ---------- COURIER TESTS ----------

    @Test
    public void testRejectCourier() {
        Courier courier = createTestCourier("rejectme@example.com");
        var response = adminService.rejectCourier(courier.getId());
        assertEquals("Courier rejected.", response.getBody());
        assertEquals(AccountStatus.REJECTED, courierRepository.findById(courier.getId()).get().getStatus());
    }

    @Test
    public void testApproveCourier() {
        Courier courier = createTestCourier("approve@example.com");
        var response = adminService.approveCourier(courier.getId());
        assertEquals("Courier approved.", response.getBody());
        assertEquals(AccountStatus.APPROVED, courierRepository.findById(courier.getId()).get().getStatus());
    }

    @Test
    public void testBanAndUnbanCourier() {
        Courier courier = createTestCourier("banme@example.com");
        adminService.banCourier(courier.getId());
        assertEquals(AccountStatus.BANNED, courierRepository.findById(courier.getId()).get().getStatus());

        adminService.unbanCourier(courier.getId());
        assertEquals(AccountStatus.APPROVED, courierRepository.findById(courier.getId()).get().getStatus());
    }

    @Test
    public void testUnbanCourier_invalidId() {
        var response = adminService.unbanCourier(99999L);
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Courier not found", response.getBody());
    }

    @Test
    public void testGetAllCouriers_containsCreated() {
        Courier c1 = createTestCourier("c1@example.com");
        Courier c2 = createTestCourier("c2@example.com");

        var response = adminService.getAllCouriers();

        var couriers = response.getBody();
        assertNotNull(couriers);
        assertTrue(couriers.stream().anyMatch(c -> c.getEmail().equals("c1@example.com")));
        assertTrue(couriers.stream().anyMatch(c -> c.getEmail().equals("c2@example.com")));
    }


}