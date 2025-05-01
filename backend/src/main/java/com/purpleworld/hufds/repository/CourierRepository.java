package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Courier;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.entity.OrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourierRepository extends JpaRepository<Courier, Long> {
    Optional<Courier> findByEmail(String email);

    Optional<Courier> findBySsn(String ssn);


    List<Courier> findByStatus(AccountStatus status);

    boolean existsByQueuedOrder(OrderGroup orderGroup);
    List<Courier> findAllByIsAvailableTrueAndIsWorkingTrue();

    List<Courier> findAllByIsAvailableFalseAndIsWorkingTrue();}
