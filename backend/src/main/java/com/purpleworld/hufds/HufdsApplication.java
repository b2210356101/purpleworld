package com.purpleworld.hufds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.purpleworld.hufds")
public class HufdsApplication {

	public static void main(String[] args) {
		SpringApplication.run(HufdsApplication.class, args);
	}

}
