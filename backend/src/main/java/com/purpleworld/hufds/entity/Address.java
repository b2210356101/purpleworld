package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;
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

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(name = "city", length = 50, nullable = true)
    private String city;

    @Column(name = "district", length = 50, nullable = true)
    private String district;

    @Column(name = "neighborhood", length = 100, nullable = true)
    private String neighborhood;

    @Column(name = "street", length = 100, nullable = true)
    private String street;

    @Column(name = "building_number", length = 20, nullable = true)
    private String buildingNumber;

    @Column(name = "apartment_number", length = 20, nullable = true)
    private String apartmentNumber;

    @Column(name = "full_address", length = 255, nullable = true)
    private String fullAddress;

    @Column(name = "postal_code", length = 255, nullable = true)
    private String postalCode;



    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

}