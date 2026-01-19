package com.example.financialtracker.service;

import com.example.financialtracker.model.Budget;
import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.BudgetRepository;
import com.example.financialtracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final EmailService emailService;

    public BudgetServiceImpl(BudgetRepository budgetRepository, TransactionRepository transactionRepository,
            EmailService emailService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public Budget setBudget(User user, String category, BigDecimal amount, Integer month, Integer year) {
        Budget budget = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, month, year)
                .orElse(new Budget());

        budget.setUser(user);
        budget.setCategory(category);
        budget.setAmount(amount);
        budget.setMonth(month);
        budget.setYear(year);

        return budgetRepository.save(budget);
    }

    @Override
    public List<Map<String, Object>> getBudgetStatus(User user, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findAllByUserAndMonthAndYear(user, month, year);

        // Use repo method for monthly summary or aggregate here
        // For simplicity and since we have findExpensesByCategory in
        // TransactionRepository,
        // we'll need to fetch the total for each budgeted category.

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Object[]> expenseData = transactionRepository.findExpensesByCategory(user, startDate, endDate);
        Map<String, BigDecimal> categoryExpenses = expenseData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (BigDecimal) row[1],
                        BigDecimal::add));

        return budgets.stream().map(b -> {
            Map<String, Object> status = new HashMap<>();
            BigDecimal actualSpent = categoryExpenses.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            status.put("category", b.getCategory());
            status.put("budgeted", b.getAmount());
            status.put("actual", actualSpent);

            BigDecimal percent = b.getAmount().compareTo(BigDecimal.ZERO) > 0
                    ? actualSpent.multiply(new BigDecimal("100")).divide(b.getAmount(), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            status.put("percent", percent);

            return status;
        }).collect(Collectors.toList());
    }

    @Override
    public void checkBudgetAlert(User user, String category, BigDecimal amount) {
        LocalDate now = LocalDate.now();
        budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, now.getMonthValue(), now.getYear())
                .ifPresent(budget -> {
                    // Check if new transaction puts them over
                    LocalDate startDate = now.withDayOfMonth(1);
                    LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());

                    List<Object[]> expenseData = transactionRepository.findExpensesByCategory(user, startDate, endDate);
                    BigDecimal currentSpent = expenseData.stream()
                            .filter(row -> row[0].equals(category))
                            .map(row -> (BigDecimal) row[1])
                            .findFirst()
                            .orElse(BigDecimal.ZERO);

                    if (currentSpent.compareTo(budget.getAmount()) > 0) {
                        emailService.sendSimpleMessage(
                                user.getEmail(),
                                "Budget Alert: " + category,
                                "You have exceeded your budget for " + category + ".\n" +
                                        "Budget: " + budget.getAmount() + " XAF\n" +
                                        "Current Spending: " + currentSpent + " XAF");
                    }
                });
    }
}
