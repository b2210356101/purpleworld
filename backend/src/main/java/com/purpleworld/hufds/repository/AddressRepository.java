package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Address;
import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findAllByCustomer(Customer customer);

    Optional<Address> findByCustomer(Customer customer);

    List<Address> findAllByRestaurant(Restaurant restaurant);

    Optional<Address> findByRestaurant(Restaurant restaurant);
}