package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantResponseForAdmin {
    private Long id;
    private String restaurantName;
    private String email;
    private String phoneNumber;
    private AccountStatus status;
    private String manager_Name;
    private String manager_Last_Name;
    private String tax_Id;

}
