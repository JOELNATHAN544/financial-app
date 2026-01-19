package com.example.financialtracker.service;

import com.example.financialtracker.model.Budget;
import com.example.financialtracker.model.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface BudgetService {
    Budget setBudget(User user, String category, BigDecimal amount, Integer month, Integer year);

    List<Map<String, Object>> getBudgetStatus(User user, Integer month, Integer year);

    void checkBudgetAlert(User user, String category, BigDecimal amount);
}
