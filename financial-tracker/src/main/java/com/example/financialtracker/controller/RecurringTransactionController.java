package com.example.financialtracker.controller;

import com.example.financialtracker.model.RecurringTransaction;
import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.UserRepository;
import com.example.financialtracker.service.RecurringTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
public class RecurringTransactionController {

    @Autowired
    private RecurringTransactionService recurringService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<RecurringTransaction>> getUserRecurring() {
        return ResponseEntity.ok(recurringService.getUserRecurring(getCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> createRecurring(@RequestBody RecurringTransaction recurring) {
        return ResponseEntity.ok(recurringService.createRecurring(recurring, getCurrentUser()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurring(@PathVariable Long id) {
        recurringService.deleteRecurring(id, getCurrentUser());
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
