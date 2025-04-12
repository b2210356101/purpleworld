package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.RemovableElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RemovableElementRepository extends JpaRepository<RemovableElement, Long> {
    Optional<RemovableElement> findById(Long id);
}
