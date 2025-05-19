package com.purpleworld.hufds.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierProfileUpdateRequest {
    private Boolean isAvailable;
    private Boolean isWorking;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profileImg;
}
