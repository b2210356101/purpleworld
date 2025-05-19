package com.purpleworld.hufds.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantProfileUpdateRequest {
    private String managerFirstName;
    private String managerLastName;
    private Integer maxDeliveryDistance;
    private Integer minOrderAmount;
    private String phoneNumber;
    private String profileImg;
    private String restaurantName;
}
