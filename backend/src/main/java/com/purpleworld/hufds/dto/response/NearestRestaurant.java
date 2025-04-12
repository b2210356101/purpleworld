package com.purpleworld.hufds.dto.response;

import lombok.Data;

@Data
public class NearestRestaurant {
    private Long restaurantId;
    private String restaurantName;
    private String img;
    private double rating;
    private double reviews;
    private double distanceInKm;

}