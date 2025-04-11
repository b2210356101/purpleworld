package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Menu;
import com.purpleworld.hufds.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu,Long> {
    Optional<Menu> findByRestaurant(Restaurant restaurant);

}
