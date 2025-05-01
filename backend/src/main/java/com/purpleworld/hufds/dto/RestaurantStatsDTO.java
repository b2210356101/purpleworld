// com.purpleworld.hufds.dto.RestaurantStatsDTO.java
package com.purpleworld.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RestaurantStatsDTO {
    private String label;
    private long value;
}