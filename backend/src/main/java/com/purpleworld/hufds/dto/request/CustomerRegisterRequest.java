package com.purpleworld.hufds.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRegisterRequest {
    private String first_Name;
    private String last_Name;
    private String phone_Number;
    private String email;
    private String password;

}