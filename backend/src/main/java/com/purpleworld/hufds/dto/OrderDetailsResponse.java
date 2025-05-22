package com.purpleworld.hufds.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailsResponse {
    private Long orderId;
    private String restaurantName;
    private int itemCount;
    private int totalPrice;
    private String addressName;
    private String addressFull;
    private String addressCity;
    private LocalDateTime date;
    private Double discount;

    private List<OrderItemDTO> items;

}