package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.CartGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartGroupRepository extends JpaRepository<CartGroup, Long> {
}
