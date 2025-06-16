package com.example.financialtracker.repository;

import com.example.financialtracker.model.SystemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemStatusRepository extends JpaRepository<SystemStatus, Long> {
    SystemStatus findFirstByOrderByIdAsc();
} 