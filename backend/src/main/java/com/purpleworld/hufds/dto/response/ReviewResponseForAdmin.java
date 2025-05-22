package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseForAdmin {
    private Long id;
    private String userName;
    private String userAvatar;
    private LocalDateTime reviewDate;
    private Long orderGroupId;
    private String restaurantName;
    private String review;
    private String restaurantReply;
    private String orderDetails;
}
