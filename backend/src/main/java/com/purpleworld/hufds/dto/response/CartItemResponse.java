package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {
    private Long itemId;
    private String itemName;
    private int itemPrice;
    private int quantity;
    private String itemImg;
    private List<String> removable;

}
