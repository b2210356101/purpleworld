package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByEmail(String email);
    Optional<Restaurant> findByTaxId(String taxId);
    List<Restaurant> findByStatus(AccountStatus accountStatus);
}