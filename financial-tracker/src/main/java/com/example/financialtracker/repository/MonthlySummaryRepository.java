package com.example.financialtracker.repository;

import com.example.financialtracker.model.MonthlySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.Optional;

@Repository
public interface MonthlySummaryRepository extends JpaRepository<MonthlySummary, Long> {
    Optional<MonthlySummary> findByMonthYear(YearMonth monthYear);
    Optional<MonthlySummary> findTopByOrderByMonthYearDesc();
} 