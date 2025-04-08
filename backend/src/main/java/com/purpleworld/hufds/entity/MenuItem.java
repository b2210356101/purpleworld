package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "MenuItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Price", nullable = false)
    private Integer price;

    @Column(name = "Description")
    private String description;

    @Column(name = "IsAvailable")
    private Boolean isAvailable;

    @Lob
    @Column(name = "Img",columnDefinition = "TEXT")
    private String img;

    @ManyToOne
    @JoinColumn(name = "CategoryID")
    private Category category;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RemovableElement> removableElements;
}
