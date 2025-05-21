package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "CartItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_group_id")
    private CartGroup cartGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @Column(name = "quantity", nullable = false)
    private int quantity;
    
    // Remove the string field
    // @Column(name = "removable_elements")
    // private String removableElements;
    
    // Add a join table for a many-to-many relationship
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "cart_item_removable_elements",
        joinColumns = @JoinColumn(name = "cart_item_id"),
        inverseJoinColumns = @JoinColumn(name = "removable_element_id")
    )
    private List<RemovableElement> removableElements = new ArrayList<>();
}