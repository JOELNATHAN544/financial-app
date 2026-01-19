package com.example.financialtracker.service;

import com.example.financialtracker.model.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReportService {
    List<Map<String, Object>> getExpensesByCategory(User user, LocalDate startDate, LocalDate endDate);

    List<Map<String, Object>> getMonthlySummary(User user, LocalDate startDate, LocalDate endDate);
}
