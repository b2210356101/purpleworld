package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.MenuItem;
import com.purpleworld.hufds.entity.RemovableElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemovableElementRepository extends JpaRepository<RemovableElement, Long> {
    List<RemovableElement> findByMenuItem(MenuItem menuItem);
}
