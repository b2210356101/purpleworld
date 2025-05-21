package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String restaurantName;
    private String profileImg;
    private double rating;
    private double reviews;
    private double distanceInKm;
    private MenuResponse menu;
    private Double score;
    private Integer minAmount;
}
