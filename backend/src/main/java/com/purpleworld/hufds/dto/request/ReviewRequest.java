package com.purpleworld.hufds.dto.request;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private Double tasteRating;
    private Double deliveryRating;
    private Double serviceRating;
    private String review;

}