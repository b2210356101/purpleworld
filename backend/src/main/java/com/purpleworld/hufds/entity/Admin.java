package com.purpleworld.hufds.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "First_Name", nullable = false, length = 255)
    private String firstName;

    @Column(name = "Last_Name", nullable = false, length = 255)
    private String lastName;

    @Column(name = "PhoneNumber", nullable = false, length = 10)
    private String phoneNumber;

    @Column(name = "Email", nullable = false, length = 255)
    private String email;

    @Column(name = "Password", nullable = false, length = 32)
    private String password;

}