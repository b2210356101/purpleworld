package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartSummaryResponse {
    private int cartTotal;
    private double discountAmount;
    private double finalTotal;
    private String couponCode;
    private Boolean isPercent;
}
