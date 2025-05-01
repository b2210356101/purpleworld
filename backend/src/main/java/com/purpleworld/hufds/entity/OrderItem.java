package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //@Column(name = "order_group_id", nullable = false)
   // private Long orderGroupId;

    @Column(name = "menu_item_id", nullable = false)
    private Long menuItemId;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_group_id", nullable = false)
    private OrderGroup orderGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", referencedColumnName = "id", insertable = false, updatable = false)
    private MenuItem menuItem;

    @Column(name = "removables")
    private String removables; // JSON string like: ["onion", "mushroom"]
}