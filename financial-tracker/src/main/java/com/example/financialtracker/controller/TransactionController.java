package com.example.financialtracker.controller;

import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.User;
import com.example.financialtracker.service.TransactionService;
import com.example.financialtracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUser(org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User user = userService.findByUsername(userDetails.getUsername());
        if (user == null) {
            throw new RuntimeException("User not found: " + userDetails.getUsername());
        }
        return user;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<Transaction> transactions = transactionService.getAllTransactions(user);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        System.out.println("[API] POST /api/transactions reached for user: "
                + (userDetails != null ? userDetails.getUsername() : "NULL"));
        User user = getAuthenticatedUser(userDetails);
        Transaction newTransaction = transactionService.createTransaction(transaction, user);
        return new ResponseEntity<>(newTransaction, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Optional<Transaction> transaction = transactionService.getTransactionById(id, user);
        return transaction.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id,
            @RequestBody Transaction transactionDetails,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Transaction updatedTransaction = transactionService.updateTransaction(id, transactionDetails, user);
        if (updatedTransaction != null) {
            return new ResponseEntity<>(updatedTransaction, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        transactionService.deleteTransaction(id, user);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/finalize-month")
    public ResponseEntity<MonthlySummary> finalizeMonth(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        MonthlySummary summary = transactionService.finalizeMonth(user);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/history")
    public ResponseEntity<List<FinalizationLog>> getFinalizationHistory(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<FinalizationLog> finalizationHistory = transactionService.getFinalizationHistory(user);
        return new ResponseEntity<>(finalizationHistory, HttpStatus.OK);
    }
}