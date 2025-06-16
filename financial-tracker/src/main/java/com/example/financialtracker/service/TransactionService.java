package com.example.financialtracker.service;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.FinalizationLog;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface TransactionService {
    List<Transaction> getAllTransactions();
    Transaction createTransaction(Transaction transaction);
    Optional<Transaction> getTransactionById(Long id);
    Transaction updateTransaction(Long id, Transaction transaction);
    void deleteTransaction(Long id);
    MonthlySummary finalizeMonth();
    BigDecimal getCurrentBalance();
    List<FinalizationLog> getFinalizationHistory();
} 