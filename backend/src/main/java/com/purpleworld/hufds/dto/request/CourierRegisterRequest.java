package com.purpleworld.hufds.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierRegisterRequest {
    private String first_Name;
    private String last_Name;
    private String ssn;
    private String email;
    private String phone_Number;
    private String password;
}