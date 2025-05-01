package com.purpleworld.hufds.entity;

import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Restaurant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Restaurant_Name", nullable = false, length = 255)
    private String restaurantName;

    @Column(name = "ProfileImg",columnDefinition = "TEXT")
    private String profileImg;

    @Column(name = "Password", nullable = false, length = 255)
    private String password;

    @Column(name = "Email", nullable = false, length = 50,unique = true)
    private String email;

    @Column(name = "PhoneNumber", nullable = false, length = 10)
    private String phoneNumber;

    @Column(name = "Manager_First_Name", nullable = false, length = 255)
    private String managerFirstName;

    @Column(name = "Manager_Last_Name", nullable = false, length = 255)
    private String managerLastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private AccountStatus status = AccountStatus.PENDING;

    @Column(name = "MaxDeliveryDistance")
    private Integer maxDeliveryDistance;

    @Column(name = "MinOrderAmount")
    private Integer minOrderAmount;

    @Column(name = "TaxID", length = 10)
    private String taxId;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "rating")
    private Double rating = -1.0;

    @PrePersist
    public void setDefaultRole() {
        if (this.role == null) {
            this.role = Role.RESTAURANT;
        }
    }
}