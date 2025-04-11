package com.purpleworld.hufds.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    private Long customerId;
    private Long restaurantId;
    private Long menuItemId;
    private int quantity;
}
