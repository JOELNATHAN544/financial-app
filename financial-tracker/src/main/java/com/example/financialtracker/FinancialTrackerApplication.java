package com.example.financialtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
		org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
		org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class
})
@EntityScan("com.example.financialtracker.model")
@EnableJpaRepositories("com.example.financialtracker.repository")
@EnableScheduling
@EnableRetry
@EnableAsync
public class FinancialTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinancialTrackerApplication.class, args);
	}

}