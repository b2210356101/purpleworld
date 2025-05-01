package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingInfoResponseDTO {
    private double lat;
    private double lng;
    private int remainingDurationMinutes;
    private double remainingDistanceKm;
    private boolean completed;
}
