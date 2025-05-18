package com.purpleworld.hufds.entity;

import java.time.LocalDateTime;

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

    @Column(name = "UserName")
    private String userName;

    @Column(name = "UserAvatar")
    private String userAvatar;

    @Column(name = "ReviewDate")
    private LocalDateTime reviewDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderGroupID", nullable = false)
    private OrderGroup orderGroup;

    @Column(name = "TasteRating", nullable = false)
    private double tasteRating;

    @Column(name = "DeliveryRating", nullable = false)
    private double deliveryRating;

    @Column(name = "ServiceRating", nullable = false)
    private double serviceRating;

    @Column(name = "Review", length = 250)
    private String review;

    @Column(name = "RestaurantReply", length = 250)
    private String restaurantReply;
}