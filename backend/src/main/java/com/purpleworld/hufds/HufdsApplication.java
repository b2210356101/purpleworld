package com.purpleworld.hufds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
		scanBasePackages = "com.purpleworld.hufds"
)
@EnableJpaRepositories(basePackages = "com.purpleworld.hufds.repository")
@EnableScheduling
public class HufdsApplication {
	public static void main(String[] args) {
		SpringApplication.run(HufdsApplication.class, args);
	}
}