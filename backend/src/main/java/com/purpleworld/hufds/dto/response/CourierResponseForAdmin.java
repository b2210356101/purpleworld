package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourierResponseForAdmin {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private AccountStatus status;
    private String ssn;
}
