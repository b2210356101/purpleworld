package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.OrderGroupDTO;
import com.purpleworld.hufds.dto.RestaurantStatsDTO;

import java.util.List;

public interface RestaurantOrderService {
    List<OrderGroupDTO> getOrdersForRestaurant(String email);
    List<OrderGroupDTO> getActiveOrdersForRestaurant(String email);

    void acceptOrder(String email, Long orderGroupId);

    void rejectOrder(String email, Long orderGroupId);

    void markOrderAsPrepared(String email, Long orderGroupId);
    List<RestaurantStatsDTO> getStatsForRestaurant(String restaurantEmail);

}