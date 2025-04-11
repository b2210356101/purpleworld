package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private List<MenuItemResponse> menuItems = new ArrayList<>();

    public CategoryResponse (Category category) {
        this.id = category.getId();
        this.name = category.getName();

        if (category.getMenuItems() != null) {
            this.menuItems = category.getMenuItems().stream()
                    .map(MenuItemResponse::new)
                    .collect(Collectors.toList());
        }
    }
}
