package com.purpleworld.hufds.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private Double latitude;
    private Double longitude;
    private String name;
    private String fullAddress;
    private String buildingNumber;
    private String apartmentNumber;
    private String floor;
    private String phoneNumber;
    private String deliveryNote;
}