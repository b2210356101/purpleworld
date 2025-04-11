package com.purpleworld.hufds.dto.request;

import com.purpleworld.hufds.entity.RemovableElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItemRequest {
    private String name;
    private Integer price;
    private String description;
    private String img;
    private String removableElements;

}
