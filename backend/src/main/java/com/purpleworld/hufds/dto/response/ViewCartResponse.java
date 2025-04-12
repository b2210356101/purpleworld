package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewCartResponse {
    private Long cartId;
    private int totalQuantity;
    private int cartTotal;
    private int groupCount;
    private List<CartGroupResponse> groups;
}
