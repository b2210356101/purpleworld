package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "address")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customerid", nullable = false)
    private Long customerId;

    @Column(name = "city", length = 30, nullable = false)
    private String city;

    @Column(name = "address", length = 100, nullable = false)
    private String address;

    @Column(name = "phone", length = 10, nullable = false)
    private String phone;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;

    @Column(name = "district", nullable = false)
    private Integer district;
}