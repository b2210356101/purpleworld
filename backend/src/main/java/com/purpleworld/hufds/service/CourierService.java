package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.CourierOrderDTO;
import com.purpleworld.hufds.dto.CourierStatsDTO;

import java.util.List;

public interface CourierService {
    List<CourierOrderDTO> getAssignedOrdersForCourier(String email);
    void pickedUp(String email,Long orderGroupId);
    CourierStatsDTO getCourierStats(String email);
    void changeAvailability(String email);

    void delivered(String email, Long orderGroupId);

}