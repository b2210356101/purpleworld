package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Courier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourierRepository extends JpaRepository<Courier, Long> {
    Optional<Courier> findByEmail(String email);

    Optional<Courier> findBySsn(String ssn);
}