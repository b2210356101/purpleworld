package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CustomerID", nullable = false)
    private Long customerId;

    @Column(name = "RestaurantID", nullable = false)
    private Long restaurantId;
}