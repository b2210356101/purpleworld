package com.purpleworld.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class OrderItemDTO {
    private String name;
    private Long menuItemId;
    private int quantity;
    private int price;
    private List<RemovableElementDTO> removableElements = new ArrayList<>();
    
    // Keep this constructor for backward compatibility
    public OrderItemDTO(String name, Long menuItemId, int quantity, int price, String removablesStr) {
        this.name = name;
        this.menuItemId = menuItemId;
        this.quantity = quantity;
        this.price = price;
        this.removableElements = new ArrayList<>();
    }
    
    // Add new constructor that accepts RemovableElementDTOs
    public OrderItemDTO(String name, Long menuItemId, int quantity, int price, 
                       List<RemovableElementDTO> removableElements) {
        this.name = name;
        this.menuItemId = menuItemId;
        this.quantity = quantity;
        this.price = price;
        this.removableElements = removableElements != null ? removableElements : new ArrayList<>();
    }
}