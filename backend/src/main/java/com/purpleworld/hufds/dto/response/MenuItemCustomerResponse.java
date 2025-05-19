package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemCustomerResponse {
    private Long id;
    private String name;
    private Integer price;
    private String description;
    private String img;
    private RestaurantResponse restaurant;
    private Boolean isAvailable;
}
