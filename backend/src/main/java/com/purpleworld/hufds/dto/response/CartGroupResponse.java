package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartGroupResponse {
    private Long restaurantId;
    private String restaurantName;
    private String note;
    private Long groupId;
    private List<CartItemResponse> items;
    private Integer minAmount;
}
