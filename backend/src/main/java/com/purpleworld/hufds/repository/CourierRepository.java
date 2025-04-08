package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Courier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourierRepository extends JpaRepository<Courier, Long> {
    Optional<Courier> findByEmail(String email);

    Optional<Courier> findBySsn(String ssn);
}