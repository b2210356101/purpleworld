package com.purpleworld.hufds.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderGroupDTO {
    private Long orderGroupId;
    private String restaurantName;
    private Integer restaurantTotal;
    private String img;
    private String note;
    private String status;
    private Long customerId;
    private String customerName;
    private Double rating = -1.0;


    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime orderedDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime preperationDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime takenOverDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime deliveredDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime rejectionDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime cancelledDate;
    
    private List<OrderItemDTO> orderItems;

    private ReviewDTO review;

}