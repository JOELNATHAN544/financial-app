package com.example.financialtracker.service;

import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reports", key = "#user.username + '-' + #startDate.toString() + '-' + #endDate.toString() + '-category'")
    public List<Map<String, Object>> getExpensesByCategory(User user, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = transactionRepository.findExpensesByCategory(user, startDate, endDate);

        return results.stream().map(result -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", result[0]); // Category name
            map.put("value", result[1]); // Total amount
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reports", key = "#user.username + '-' + #startDate.toString() + '-' + #endDate.toString() + '-monthly'")
    public List<Map<String, Object>> getMonthlySummary(User user, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = transactionRepository.findDailyExpenses(user, startDate, endDate);

        return results.stream().map(result -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", result[0] != null ? result[0].toString() : ""); // Date
            map.put("amount", result[1]); // Total amount
            return map;
        }).collect(Collectors.toList());
    }
}
