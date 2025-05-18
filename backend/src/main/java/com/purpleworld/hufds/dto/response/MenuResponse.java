package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuResponse {
    private Long menuId;
    private String restaurantName;
    private List<CategoryResponse> categories;
    private PageInfo pageInfo;
    private MenuStats stats;

    public MenuResponse(Long menuId, String restaurantName, List<CategoryResponse> categories) {
        this.menuId = menuId;
        this.restaurantName = restaurantName;
        this.categories = categories;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PageInfo {
        private int pageNumber;
        private int pageSize;
        private int totalPages;
        private long totalElements;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MenuStats {
        private long totalItems;
        private long inStockItems;
        private long outOfStockItems;
    }
}