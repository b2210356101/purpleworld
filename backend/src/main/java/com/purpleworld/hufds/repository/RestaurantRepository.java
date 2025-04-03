package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByEmail(String email);
    Optional<Restaurant> findByTaxId(String taxId);

}
