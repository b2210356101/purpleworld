package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findAllByCustomerId(Long customerId);
    Optional<Favorite> findByCustomerIdAndRestaurantId(Long customerId, Long restaurantId);
    void deleteByCustomerIdAndRestaurantId(Long customerId, Long restaurantId);
    boolean existsByCustomerIdAndRestaurantId(Long customerId, Long restaurantId);
}