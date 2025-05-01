package com.purpleworld.hufds.repository;

import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {


    List<Order> findByCustomerOrderByOrderedDateDesc(Customer customer);


}
