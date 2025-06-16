package com.example.financialtracker.service;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.model.User;
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
    public List<Transaction> getAllTransactions(User user) {
        return transactionRepository.findAllByUser(user);
    }

    @Override
    @Transactional
    public Transaction createTransaction(Transaction transaction, User user) {
        // Set the current date if not provided
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }

        // Set the user for the transaction
        transaction.setUser(user);

        // Get the last transaction or monthly summary to determine the starting balance
        BigDecimal startingBalance = BigDecimal.ZERO;
        Optional<Transaction> lastTransaction = transactionRepository.findTopByUserOrderByDateDesc(user);
        
        if (lastTransaction.isPresent()) {
            startingBalance = lastTransaction.get().getBalance();
        } else {
            // If no transactions exist, get the last month's closing balance for this user
            Optional<MonthlySummary> lastSummary = monthlySummaryRepository.findTopByUserOrderByMonthYearDesc(user);
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
    public Optional<Transaction> getTransactionById(Long id, User user) {
        return transactionRepository.findByIdAndUser(id, user);
    }

    @Override
    public Transaction updateTransaction(Long id, Transaction transactionDetails, User user) {
        return transactionRepository.findByIdAndUser(id, user)
                .map(transaction -> {
                    transaction.setDate(transactionDetails.getDate());
                    transaction.setUsedFor(transactionDetails.getUsedFor());
                    transaction.setCredit(transactionDetails.getCredit());
                    transaction.setDebit(transactionDetails.getDebit());
                    // No need to set balance here, it will be recalculated when the next transaction is added or can be updated explicitly if needed.
                    // Ensure the user is set for the updated transaction as well
                    transaction.setUser(user);
                    return transactionRepository.save(transaction);
                })
                .orElseThrow(() -> new RuntimeException("Transaction not found or does not belong to user"));
    }

    @Override
    public void deleteTransaction(Long id, User user) {
        transactionRepository.deleteByIdAndUser(id, user);
    }

    @Override
    @Transactional
    public MonthlySummary finalizeMonth(User user) {
        // Get the last transaction to get the final balance for this user
        Optional<Transaction> lastTransaction = transactionRepository.findTopByUserOrderByDateDesc(user);
        if (lastTransaction.isEmpty()) {
            // If no transactions exist for this user, return a new MonthlySummary
            MonthlySummary emptySummary = new MonthlySummary();
            emptySummary.setUser(user);
            emptySummary.setMonthYear(YearMonth.now()); // Or use an appropriate YearMonth
            emptySummary.setClosingBalance(BigDecimal.ZERO);
            return monthlySummaryRepository.save(emptySummary);
        }

        Transaction transaction = lastTransaction.get();
        BigDecimal finalBalance = transaction.getBalance();

        // Create and save the monthly summary for this user
        MonthlySummary summary = new MonthlySummary();
        summary.setMonthYear(YearMonth.from(transaction.getDate()));
        summary.setClosingBalance(finalBalance);
        summary.setUser(user);
        MonthlySummary savedSummary = monthlySummaryRepository.save(summary);

        // Clear all transactions for this user
        transactionRepository.deleteAllByUser(user);

        return savedSummary;
    }

    @Override
    public BigDecimal getCurrentBalance(User user) {
        Optional<Transaction> lastTransaction = transactionRepository.findTopByUserOrderByDateDesc(user);
        if (lastTransaction.isPresent()) {
            return lastTransaction.get().getBalance();
        }
        
        // If no transactions exist, get the last month's closing balance for this user
        Optional<MonthlySummary> lastSummary = monthlySummaryRepository.findTopByUserOrderByMonthYearDesc(user);
        if (lastSummary.isPresent()) {
            return lastSummary.get().getClosingBalance();
        }
        
        return BigDecimal.ZERO;
    }

    @Override
    public List<FinalizationLog> getFinalizationHistory(User user) {
        return finalizationLogRepository.findAllByUserOrderByFinalizationDateDesc(user);
    }
} 