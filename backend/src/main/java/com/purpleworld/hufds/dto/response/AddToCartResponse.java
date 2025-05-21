package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.dto.RemovableElementDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddToCartResponse {
    private String message;
    private Long cartId;
    private Long cartGroupId;
    private Long cartItemId;
    private int totalQuantity;
    private String itemName;
    private int itemPrice;
    private int cartTotal;
    private String restaurantName;
    private int groupCount;
    private List<RemovableElementDTO> removedElements;
}