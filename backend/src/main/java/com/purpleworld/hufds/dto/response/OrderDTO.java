package com.purpleworld.hufds.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.purpleworld.hufds.dto.OrderGroupDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long orderId;
    private Integer totalPrice;
    private String paymentType;
    private String note;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime orderedDate;

    private String status;

    private List<OrderGroupDTO> orderGroups;
}
