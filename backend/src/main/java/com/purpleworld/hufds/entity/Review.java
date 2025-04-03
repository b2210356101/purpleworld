package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "RestaurantID", nullable = false)
    private Long restaurantId;

    @Column(name = "CustomerID", nullable = false)
    private Long customerId;

    @Column(name = "OrderID", nullable = false)
    private Long orderId;

    @Column(name = "Review", length = 250)
    private String review;

    @Column(name = "ReplyReview")
    private String replyReview;
}