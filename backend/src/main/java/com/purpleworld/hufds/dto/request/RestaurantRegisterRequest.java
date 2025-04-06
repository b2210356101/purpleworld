package com.purpleworld.hufds.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String manager_Name;
    private String manager_Last_Name;
    private String phone_Number;
    private String address;
    private String tax_Id;
    private Double latitude;
    private Double longitude;
    private byte[] profile_image;

    private String buildingNumber;
    private String apartmentNumber;
}