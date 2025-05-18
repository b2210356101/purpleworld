package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantWithMenuItemResponse {
    private Long restaurantId;
    private String restaurantName;
    private String profileImg;
    private double distanceInKm;
    private List<MenuItemResponse> matchedItems;
    private Double ratings;
    private Double reviews;

}