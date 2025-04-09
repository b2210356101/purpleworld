package com.purpleworld.hufds.entity;

import com.purpleworld.hufds.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "First_Name", nullable = false, length = 255)
    private String firstName;

    @Column(name = "Last_Name", nullable = false, length = 255)
    private String lastName;

    @Column(name = "Email", nullable = false, length = 50)
    private String email;

    @Column(name = "Password", nullable = false, length = 255)
    private String password;

    @Column(name = "PhoneNumber", length = 10,nullable = false)
    private String phoneNumber;

    @Lob
    @Column(name = "ProfileImg",columnDefinition = "TEXT")
    private String profileImg;

    @Column(name = "CurrentAddressId")
    private Long currentAddressId;

    @Column(name = "IsBanned", nullable = false)
    private boolean isBanned;

    @Enumerated(EnumType.STRING)
    private Role role;

    @PrePersist
    public void setDefaultRole() {
        if (this.role == null) {
            this.role = Role.CUSTOMER;
        }
    }
}