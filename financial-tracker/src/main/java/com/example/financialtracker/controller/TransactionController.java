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
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from your React frontend
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(@AuthenticationPrincipal User user) {
        List<Transaction> transactions = transactionService.getAllTransactions(user);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction, @AuthenticationPrincipal User user) {
        // Ensure the user is associated with the transaction before saving
        transaction.setUser(user);
        Transaction newTransaction = transactionService.createTransaction(transaction, user);
        return new ResponseEntity<>(newTransaction, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Optional<Transaction> transaction = transactionService.getTransactionById(id, user);
        return transaction.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transactionDetails, @AuthenticationPrincipal User user) {
        Transaction updatedTransaction = transactionService.updateTransaction(id, transactionDetails, user);
        if (updatedTransaction != null) {
            return new ResponseEntity<>(updatedTransaction, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, @AuthenticationPrincipal User user) {
        transactionService.deleteTransaction(id, user);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/finalize-month")
    public ResponseEntity<MonthlySummary> finalizeMonth(@AuthenticationPrincipal User user) {
        MonthlySummary summary = transactionService.finalizeMonth(user);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/finalization-history")
    public ResponseEntity<List<FinalizationLog>> getFinalizationHistory(@AuthenticationPrincipal User user) {
        List<FinalizationLog> finalizationHistory = transactionService.getFinalizationHistory(user);
        return new ResponseEntity<>(finalizationHistory, HttpStatus.OK);
    }
} 