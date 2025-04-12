package com.purpleworld.hufds.dto.request;

import com.purpleworld.hufds.dto.response.RemovableElementResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    private Long menuItemId;
    private int quantity;
    private String removableElements;
}
