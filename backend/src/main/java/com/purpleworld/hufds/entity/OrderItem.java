package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "order_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    // Remove the string field
    // @Column(name = "removables")
    // private String removables;
    
    // Add a join table for a many-to-many relationship
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "order_item_removable_elements",
        joinColumns = @JoinColumn(name = "order_item_id"),
        inverseJoinColumns = @JoinColumn(name = "removable_element_id")
    )
    private List<RemovableElement> removableElements = new ArrayList<>();
}