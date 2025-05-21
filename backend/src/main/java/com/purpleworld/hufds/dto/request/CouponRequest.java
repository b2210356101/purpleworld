package com.purpleworld.hufds.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CouponRequest {
    private String name;
    private String description;
    private Boolean isPercent;
    private Integer discountAmount;
    private Integer minOrderAmount;
    private LocalDate expiryDate;
}
