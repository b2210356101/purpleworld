package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.entity.MenuItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItemResponse {
    private Long id;
    private String name;
    private Integer price;
    private String description;
    private String img;
    private List<RemovableElementResponse> removableElements;
    private Boolean isAvailable;


    public MenuItemResponse (MenuItem menuItem,List<RemovableElementResponse> removableElements) {
        this.id = menuItem.getId();
        this.name = menuItem.getName();
        this.price = menuItem.getPrice();
        this.description = menuItem.getDescription();
        this.img = menuItem.getImg();
        this.removableElements = removableElements;
        this.isAvailable = menuItem.getIsAvailable();
    }

}