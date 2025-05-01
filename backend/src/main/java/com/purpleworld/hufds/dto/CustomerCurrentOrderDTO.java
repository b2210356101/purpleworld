package com.purpleworld.hufds.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerCurrentOrderDTO {
    private Long orderGroupId;
    private Long restaurantId;
    private String restaurantName;
    private String img;
    private int itemCount;
    private int totalPrice;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime orderedDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalDateTime estimatedDeliveryTime; // Optional: estimated delivery

    private double distanceInKm;
}