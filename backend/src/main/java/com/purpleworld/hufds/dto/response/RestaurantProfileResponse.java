package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantProfileResponse {
    private Long id;
    private String restaurantName;
    private String email;
    private String phoneNumber;
    private String profileImg;
    private String managerFirstName;
    private String managerLastName;
    private Integer maxDeliveryDistance;
    private Integer minOrderAmount;
}

