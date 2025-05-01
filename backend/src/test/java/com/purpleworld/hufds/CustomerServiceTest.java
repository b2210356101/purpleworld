package com.purpleworld.hufds;

import com.purpleworld.hufds.dto.request.AddressRequest;
import com.purpleworld.hufds.entity.Address;
import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.service.CustomerService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.Rollback;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@Rollback
public class CustomerServiceTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AddressRepository addressRepository;

    private Customer createTestCustomer(String email) {
        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setFirstName("Test");
        customer.setLastName("User");
        customer.setPhoneNumber("5551234567");
        customer.setPassword("encodedpassword");
        customer.setRole(Role.CUSTOMER);
        return customerRepository.save(customer);
    }

    private AddressRequest createAddressRequest() {
        AddressRequest request = new AddressRequest();
        request.setName("Home");
        request.setLatitude(39.92);
        request.setLongitude(32.85);
        request.setBuildingNumber("10");
        request.setApartmentNumber("5");
        request.setFloor("2");
        request.setFullAddress("Some Full Address");
        request.setPhoneNumber("1234567890");
        request.setDeliveryNote("Leave at door");
        return request;
    }

    @Test
    public void testCreateAddressSuccessfully() {
        Customer customer = createTestCustomer("testcustomer@example.com");

        AddressRequest request = createAddressRequest();

        ResponseEntity<?> response = customerService.createAddress(request, customer.getEmail());

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Address saved successfully", response.getBody());
    }

    @Test
    public void testSetCurrentAddressSuccessfully() {
        Customer customer = createTestCustomer("customer2@example.com");
        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer.getEmail());

        Address address = addressRepository.findAllByCustomer(customer).get(0);

        ResponseEntity<?> response = customerService.setCurrentAddress(address.getId(), customer.getEmail());

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Current address set successfully", response.getBody());
    }

    @Test
    public void testSetCurrentAddressForbidden() {
        Customer customer1 = createTestCustomer("customer3@example.com");
        Customer customer2 = createTestCustomer("othercustomer@example.com");

        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer2.getEmail());
        Address address = addressRepository.findAllByCustomer(customer2).get(0);

        ResponseEntity<?> response = customerService.setCurrentAddress(address.getId(), customer1.getEmail());

        assertEquals(403, response.getStatusCodeValue());
        assertTrue(response.getBody().toString().contains("Forbidden"));
    }

    @Test
    public void testGetCurrentAddressSuccessfully() {
        Customer customer = createTestCustomer("customer4@example.com");
        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer.getEmail());

        Address address = addressRepository.findAllByCustomer(customer).get(0);
        customerService.setCurrentAddress(address.getId(), customer.getEmail());

        ResponseEntity<?> response = customerService.getCurrentAddress(customer.getEmail());

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody().toString().contains("addressId"));
    }

    @Test
    public void testDeleteAddressSuccessfully() {
        Customer customer = createTestCustomer("customer5@example.com");
        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer.getEmail());

        Address address = addressRepository.findAllByCustomer(customer).get(0);

        ResponseEntity<?> response = customerService.deleteAddress(address.getId(), customer.getEmail());

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Address deleted successfully", response.getBody());
    }

    @Test
    public void testDeleteAddressForbidden() {
        Customer customer1 = createTestCustomer("customer6@example.com");
        Customer customer2 = createTestCustomer("othercustomer2@example.com");

        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer2.getEmail());
        Address address = addressRepository.findAllByCustomer(customer2).get(0);

        ResponseEntity<?> response = customerService.deleteAddress(address.getId(), customer1.getEmail());

        assertEquals(403, response.getStatusCodeValue());
        assertTrue(response.getBody().toString().contains("Forbidden"));
    }

    @Test
    public void testUpdateAddressSuccessfully() {
        Customer customer = createTestCustomer("customer7@example.com");
        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer.getEmail());

        Address address = addressRepository.findAllByCustomer(customer).get(0);

        AddressRequest updateRequest = new AddressRequest();
        updateRequest.setName("Work");
        updateRequest.setLatitude(40.0);
        updateRequest.setLongitude(30.0);
        updateRequest.setBuildingNumber("20");
        updateRequest.setApartmentNumber("8");
        updateRequest.setFloor("5");
        updateRequest.setFullAddress("Updated Address");
        updateRequest.setPhoneNumber("9876543210");
        updateRequest.setDeliveryNote("Ring the bell");

        ResponseEntity<?> response = customerService.updateAddress(address.getId(), updateRequest, customer.getEmail());

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Address updated successfully", response.getBody());
    }

    @Test
    public void testUpdateAddressForbidden() {
        Customer customer1 = createTestCustomer("customer8@example.com");
        Customer customer2 = createTestCustomer("othercustomer3@example.com");

        AddressRequest request = createAddressRequest();
        customerService.createAddress(request, customer2.getEmail());
        Address address = addressRepository.findAllByCustomer(customer2).get(0);

        AddressRequest updateRequest = createAddressRequest();
        updateRequest.setFullAddress("New Address");

        ResponseEntity<?> response = customerService.updateAddress(address.getId(), updateRequest, customer1.getEmail());

        assertEquals(403, response.getStatusCodeValue());
        assertTrue(response.getBody().toString().contains("Forbidden"));
    }
}
