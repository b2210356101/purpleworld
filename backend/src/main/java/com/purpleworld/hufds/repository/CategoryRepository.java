package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Category;
import com.purpleworld.hufds.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByMenu(Menu menu);
}
