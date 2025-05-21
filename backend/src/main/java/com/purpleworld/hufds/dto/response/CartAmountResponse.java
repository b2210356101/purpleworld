package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartAmountResponse {
    private Long restaurantId;
    private Integer restAmount;
}
