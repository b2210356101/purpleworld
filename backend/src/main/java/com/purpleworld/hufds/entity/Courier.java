package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Courier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Courier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SSN", nullable = false, length = 11)
    private String ssn;

    @Column(name = "First_Name", nullable = false, length = 255)
    private String firstName;

    @Column(name = "Last_Name", nullable = false, length = 255)
    private String lastName;

    @Column(name = "IsAvailable", nullable = false)
    private boolean isAvailable;

    @Column(name = "PhoneNumber", nullable = false, length = 10)
    private String phoneNumber;

    @Column(name = "Email", nullable = false, length = 255)
    private String email;

    @Column(name = "Password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @PrePersist
    public void setDefaultRole() {
        if (this.role == null) {
            this.role = Role.COURIER;
        }
    }

}