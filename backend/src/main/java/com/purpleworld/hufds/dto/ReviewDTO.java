// This is the updated ReviewDTO class that includes orderItems
package com.purpleworld.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private double tasteRating;
    private double deliveryRating;
    private double serviceRating;
    private String review;
    private String restaurantAnswer;
    private String userName;
    private String userAvatar;
    private LocalDateTime reviewDate;
    private Long orderGroupId;
    private List<OrderItemDTO> orderItems; // Added field for order items
    
    // Constructor without orderItems for backward compatibility
    public ReviewDTO(double tasteRating, double deliveryRating, double serviceRating, 
                     String review, String restaurantAnswer, String userName, 
                     String userAvatar, LocalDateTime reviewDate, Long orderGroupId) {
        this.tasteRating = tasteRating;
        this.deliveryRating = deliveryRating;
        this.serviceRating = serviceRating;
        this.review = review;
        this.restaurantAnswer = restaurantAnswer;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.reviewDate = reviewDate;
        this.orderGroupId = orderGroupId;
    }
}