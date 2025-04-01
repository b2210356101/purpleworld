package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RemovableElements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RemovableElement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Name", nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "MenuItemID")
    private MenuItem menuItem;
}
