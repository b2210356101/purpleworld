package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Category;
import com.purpleworld.hufds.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategory(Category category);
}
