package com.example.financialtracker.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Disable FAIL_ON_EMPTY_BEANS to prevent serialization errors for Hibernate proxy objects
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        Hibernate6Module hibernate6Module = new Hibernate6Module();
        // Disable FORCE_LAZY_LOADING to prevent the module from attempting to access @Transient from javax.persistence
        hibernate6Module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        mapper.registerModule(hibernate6Module);
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
} 