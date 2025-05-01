package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.entity.OrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderGroupRepository extends JpaRepository<OrderGroup, Long> {
    List<OrderGroup> findByRestaurantId(Long restaurantId);
    List<OrderGroup> findByCourierId(Long courierId);
    List<OrderGroup> findAllByPreparedDateIsNotNullAndTakenOverDateIsNull();
}

