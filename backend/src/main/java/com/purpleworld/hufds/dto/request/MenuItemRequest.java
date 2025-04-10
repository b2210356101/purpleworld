package com.purpleworld.hufds.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItemRequest {
    private String name;
    private Integer price;
    private String description;
    private String img;

}
