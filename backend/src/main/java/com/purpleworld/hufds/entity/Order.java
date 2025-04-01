package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "courier_id")
    private Long courierId;

    @Column(name = "coupon_id")
    private Long couponId;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "address_id")
    private Long addressId;

    @Column(name = "ordered_date")
    private LocalDate orderedDate;

    @Column(name = "preperation_date")
    private LocalDate preperationDate;

    @Column(name = "taken_over_date")
    private LocalDate takenOverDate;

    @Column(name = "delivered_date")
    private LocalDate deliveredDate;

    @Column(name = "price")
    private Integer price;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderGroup> orderGroups;

    public String getStatus() {
        if (deliveredDate != null) return "DELIVERED";
        if (takenOverDate != null) return "ON_THE_WAY";
        if (preperationDate != null) return "PREPARING";
        if (orderedDate != null) return "ORDERED";
        return "UNKNOWN";
    }
}