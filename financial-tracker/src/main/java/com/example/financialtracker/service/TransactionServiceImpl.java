package com.example.financialtracker.service;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.repository.TransactionRepository;
import com.example.financialtracker.repository.MonthlySummaryRepository;
import com.example.financialtracker.repository.FinalizationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private MonthlySummaryRepository monthlySummaryRepository;

    @Autowired
    private FinalizationLogRepository finalizationLogRepository;

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Override
    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Set the current date if not provided
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }

        // Get the last transaction or monthly summary to determine the starting balance
        BigDecimal startingBalance = BigDecimal.ZERO;
        Optional<Transaction> lastTransaction = transactionRepository.findTopByOrderByDateDesc();
        
        if (lastTransaction.isPresent()) {
            startingBalance = lastTransaction.get().getBalance();
        } else {
            // If no transactions exist, get the last month's closing balance
            Optional<MonthlySummary> lastSummary = monthlySummaryRepository.findTopByOrderByMonthDescYearDesc();
            if (lastSummary.isPresent()) {
                startingBalance = lastSummary.get().getClosingBalance();
            }
        }

        // Calculate the new balance
        BigDecimal newBalance = startingBalance;
        if (transaction.getCredit() != null) {
            newBalance = newBalance.add(transaction.getCredit());
        }
        if (transaction.getDebit() != null) {
            newBalance = newBalance.subtract(transaction.getDebit());
        }
        transaction.setBalance(newBalance);

        return transactionRepository.save(transaction);
    }

    @Override
    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Override
    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        return transactionRepository.findById(id)
                .map(transaction -> {
                    transaction.setDate(transactionDetails.getDate());
                    transaction.setUsedFor(transactionDetails.getUsedFor());
                    transaction.setCredit(transactionDetails.getCredit());
                    transaction.setDebit(transactionDetails.getDebit());
                    // Balance will be recalculated when we implement more sophisticated update logic
                    // For now, let's just save the updated fields
                    return transactionRepository.save(transaction);
                })
                .orElse(null);
    }

    @Override
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void finalizeMonth() {
        // Get the last transaction to get the final balance
        Optional<Transaction> lastTransaction = transactionRepository.findTopByOrderByDateDesc();
        if (lastTransaction.isEmpty()) {
            return;
        }

        Transaction transaction = lastTransaction.get();
        BigDecimal finalBalance = transaction.getBalance();

        // Create and save the monthly summary
        MonthlySummary summary = new MonthlySummary();
        summary.setMonthYear(YearMonth.from(transaction.getDate()));
        summary.setClosingBalance(finalBalance);
        monthlySummaryRepository.save(summary);

        // Clear all transactions
        transactionRepository.deleteAll();
    }

    @Override
    public BigDecimal getCurrentBalance() {
        Optional<Transaction> lastTransaction = transactionRepository.findTopByOrderByDateDesc();
        if (lastTransaction.isPresent()) {
            return lastTransaction.get().getBalance();
        }
        
        // If no transactions exist, get the last month's closing balance
        Optional<MonthlySummary> lastSummary = monthlySummaryRepository.findTopByOrderByMonthDescYearDesc();
        if (lastSummary.isPresent()) {
            return lastSummary.get().getClosingBalance();
        }
        
        return BigDecimal.ZERO;
    }

    @Override
    public List<FinalizationLog> getFinalizationHistory() {
        return finalizationLogRepository.findAllByOrderByFinalizationDateDesc();
    }
} 