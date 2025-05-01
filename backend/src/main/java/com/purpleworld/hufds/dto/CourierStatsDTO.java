package com.purpleworld.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourierStatsDTO {
    private int totalDeliveries;
    private int todayDeliveries;
    private double totalEarnings;
    private boolean isAvailable;
}
