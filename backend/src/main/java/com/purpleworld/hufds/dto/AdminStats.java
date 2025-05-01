package com.purpleworld.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStats {
    private int totalRestaurants;
    private int totalCouriers;
    private int totalPendingApprovals;
    private int totalCoupons;
}
