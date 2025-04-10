package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;


@Data
public class MenuResponse {
    private Long menuId;
    private String restaurantName;
    private List<CategoryResponse> categories;

    public MenuResponse(Long menuId, String restaurantName, List<CategoryResponse> categories) {
        this.menuId = menuId;
        this.restaurantName = restaurantName;
        this.categories = categories;
    }

}