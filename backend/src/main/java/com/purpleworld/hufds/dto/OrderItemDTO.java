package com.purpleworld.hufds.dto; 

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {
    private String name;
    private Long menuItemId;
    private int quantity;
    private int price;
    private String removables;
}