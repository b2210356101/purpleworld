package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderGroup(OrderGroup orderGroup);

    Optional<Review> findByOrderGroupId(Long id);
}
