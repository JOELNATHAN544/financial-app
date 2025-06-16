package com.example.financialtracker.service;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.model.User;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface TransactionService {
    List<Transaction> getAllTransactions(User user);
    Transaction createTransaction(Transaction transaction, User user);
    Optional<Transaction> getTransactionById(Long id, User user);
    Transaction updateTransaction(Long id, Transaction transaction, User user);
    void deleteTransaction(Long id, User user);
    MonthlySummary finalizeMonth(User user);
    BigDecimal getCurrentBalance(User user);
    List<FinalizationLog> getFinalizationHistory(User user);
} 