package com.example.financialtracker.repository;

import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FinalizationLogRepository extends JpaRepository<FinalizationLog, Long> {
    List<FinalizationLog> findAllByOrderByFinalizationDateDesc();
    List<FinalizationLog> findAllByUserOrderByFinalizationDateDesc(User user);
} 