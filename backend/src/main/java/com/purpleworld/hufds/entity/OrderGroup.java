package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "order_group")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "restaurant_total")
    private Integer restaurantTotal;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @OneToMany(mappedBy = "orderGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;
}