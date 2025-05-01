package com.purpleworld.hufds.dto;

import com.purpleworld.hufds.dto.OrderItemDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CourierOrderDTO {
    private Long orderGroupId;
    private String status;
    private LocalDateTime orderedDate;
    private LocalDateTime takenOverDate;

    private Long customerId;
    private String customerName;
    private String customerPhone;
    private double customerLatitude;
    private double customerLongitude;
    private String customerFullAddress;

    private String restaurantName;
    private String restaurantPhone;
    private double restaurantLatitude;
    private double restaurantLongitude;

    private boolean isMainOrder;

    private List<OrderItemDTO> orderItems;
}