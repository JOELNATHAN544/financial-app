package com.example.financialtracker.controller;

import com.example.financialtracker.model.Budget;
import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.UserRepository;
import com.example.financialtracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final UserRepository userRepository;

    public BudgetController(BudgetService budgetService, UserRepository userRepository) {
        this.budgetService = budgetService;
        this.userRepository = userRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<List<Map<String, Object>>> getCurrentBudgetStatus(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        User user = getCurrentUser();
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        return ResponseEntity.ok(budgetService.getBudgetStatus(user, targetMonth, targetYear));
    }

    @PostMapping
    public ResponseEntity<Budget> setBudget(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        if (!payload.containsKey("category") || !payload.containsKey("amount")) {
            return ResponseEntity.badRequest().build();
        }
        
        String category = (String) payload.get("category");
        BigDecimal amount;
        try {
            amount = new BigDecimal(payload.get("amount").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        
        LocalDate now = LocalDate.now();
        int month = payload.containsKey("month") ? Integer.parseInt(payload.get("month").toString()) : now.getMonthValue();
        int year = payload.containsKey("year") ? Integer.parseInt(payload.get("year").toString()) : now.getYear();

        return ResponseEntity.ok(budgetService.setBudget(user, category, amount, month, year));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
