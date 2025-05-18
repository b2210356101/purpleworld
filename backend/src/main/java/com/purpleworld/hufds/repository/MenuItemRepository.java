package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Category;
import com.purpleworld.hufds.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByCategory(Category category);

    @Query("SELECT m FROM MenuItem m WHERE m.category = :category AND " +
            "(LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MenuItem> findByCategoryAndSearch(
            @Param("category") Category category,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT m FROM MenuItem m JOIN m.category c JOIN c.menu menu " +
            "WHERE menu.restaurant.id = :restaurantId AND " +
            "(LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MenuItem> findByRestaurantIdAndSearch(
            @Param("restaurantId") Long restaurantId,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COUNT(m) FROM MenuItem m JOIN m.category c JOIN c.menu menu " +
            "WHERE menu.restaurant.id = :restaurantId")
    long countByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(m) FROM MenuItem m JOIN m.category c JOIN c.menu menu " +
            "WHERE menu.restaurant.id = :restaurantId AND m.isAvailable = true")
    long countAvailableByRestaurantId(@Param("restaurantId") Long restaurantId);
}