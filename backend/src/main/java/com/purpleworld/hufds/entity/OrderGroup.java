package com.purpleworld.hufds.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Duration;
import java.time.LocalDateTime;
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

    @Column(name = "ordered_date")
    private LocalDateTime orderedDate;
    
    @Column(name = "preperation_date")
    private LocalDateTime preperationDate;

    @Column(name = "ready_for_pickup_date")
    private LocalDateTime preparedDate;
    
    @Column(name = "taken_over_date")
    private LocalDateTime takenOverDate;
    
    @Column(name = "delivered_date")
    private LocalDateTime deliveredDate;
    
    @Column(name = "rejection_date")
    private LocalDateTime rejectionDate;

    @Column(name = "cancelled_date")
    private LocalDateTime cancelledDate;
    
    @Column(name = "note")
    private String note;
    
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "courier_id")
    private Courier courier;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "rating")
    private Double rating;
    
    @OneToMany(mappedBy = "orderGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;


    public String getStatus() {
        if (cancelledDate != null) return "CANCELLED";
        if (rejectionDate != null) return "REJECTED";
        if (deliveredDate != null) return "DELIVERED";
        if (takenOverDate != null) return "ON_THE_WAY";
        if (preparedDate != null) return "READY_FOR_PICKUP";
        if (preperationDate != null) return "PREPARING";
        return "ORDERED";
    }
}