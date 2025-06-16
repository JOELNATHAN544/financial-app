package com.example.financialtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EntityScan("com.example.financialtracker.model")
@EnableJpaRepositories("com.example.financialtracker.repository")
@EnableScheduling
public class FinancialTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinancialTrackerApplication.class, args);
	}

} 