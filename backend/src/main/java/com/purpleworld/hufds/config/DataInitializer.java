package com.purpleworld.hufds.config;

import com.purpleworld.hufds.entity.Admin;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.findByEmail("admin@hufds.com").isEmpty()) {
            Admin admin = new Admin();
            admin.setFirstName("Admin");
            admin.setLastName("Admin");
            admin.setEmail("admin@hufds.com");
            admin.setPhoneNumber("5553453211");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            adminRepository.save(admin);
        }
    }
}