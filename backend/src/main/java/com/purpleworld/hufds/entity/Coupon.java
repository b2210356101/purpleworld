package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "Coupon")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description")
    private String description;

    @Column(name = "is_percent", nullable = false)
    private boolean isPercent = true;

    @Column(name = "discount_amount", nullable = false)
    private int discountAmount;

    @Column(name = "min_order_price")
    private int minOrderPrice;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "is_active")
    private boolean isActive = true;
}