package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Cart;
import com.purpleworld.hufds.entity.CartGroup;
import com.purpleworld.hufds.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartGroup(CartGroup cartGroup);
}
