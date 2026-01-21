package com.example.financialtracker.service;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.TransactionRepository;
import com.example.financialtracker.repository.MonthlySummaryRepository;
import com.example.financialtracker.repository.FinalizationLogRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class TransactionServiceImpl implements TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionServiceImpl.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private MonthlySummaryRepository monthlySummaryRepository;

    @Autowired
    private FinalizationLogRepository finalizationLogRepository;

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private EmailService emailService;

    @Override
    public List<Transaction> getAllTransactions(User user) {
        // Only return current (non-finalized) transactions for the main list
        return transactionRepository.findAllByUserAndFinalizedOrderByDateAscIdAsc(user, false);
    }

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))
    @CacheEvict(value = "reports", allEntries = true)
    public Transaction createTransaction(Transaction transaction, User user) {
        if (transaction == null) {
            throw new IllegalArgumentException("Transaction cannot be null");
        }
        transaction.setUser(user);
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }
        transaction.setFinalized(false);
        transaction.setBalance(java.math.BigDecimal.ZERO);

        // Validate that at least one of credit or debit is non-zero
        BigDecimal credit = transaction.getCredit() != null ? transaction.getCredit() : BigDecimal.ZERO;
        BigDecimal debit = transaction.getDebit() != null ? transaction.getDebit() : BigDecimal.ZERO;

        if (credit.compareTo(BigDecimal.ZERO) == 0 && debit.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("Transaction must have either credit or debit amount");
        }

        // Multi-currency handling
        String currency = transaction.getCurrency();
        if (currency == null) {
            currency = "XAF";
            transaction.setCurrency("XAF");
        }
        final String currentCurrency = currency;

        BigDecimal originalAmount = credit.compareTo(BigDecimal.ZERO) > 0 ? credit : debit;
        transaction.setOriginalAmount(originalAmount);

        if (!"XAF".equalsIgnoreCase(currentCurrency)) {
            // Convert to XAF for storage in credit/debit columns
            if (credit.compareTo(BigDecimal.ZERO) > 0) {
                transaction.setCredit(currencyService.convert(credit, currentCurrency, "XAF"));
            }
            if (debit.compareTo(BigDecimal.ZERO) > 0) {
                transaction.setDebit(currencyService.convert(debit, currentCurrency, "XAF"));
            }
        }

        // Initial save to get an ID
        Transaction saved = transactionRepository.save(transaction);

        // Recalculate all balances to ensure consistency, especially if adding to a
        // past date
        recalculateBalances(user);

        // Check for budget alerts if it's an expense
        if (transaction.getDebit() != null && transaction.getDebit().compareTo(BigDecimal.ZERO) > 0
                && budgetService != null) {
            String category = transaction.getCategory() != null ? transaction.getCategory() : "Others";
            budgetService.checkBudgetAlert(user, category, transaction.getDebit());
        }

        if (saved == null || saved.getId() == null) {
            throw new RuntimeException("Failed to save transaction: ID is null");
        }
        // Return the updated transaction from DB
        return transactionRepository.findById(saved.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found after save"));
    }

    @Override
    public Optional<Transaction> getTransactionById(Long id, User user) {
        return transactionRepository.findByIdAndUser(id, user);
    }

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))
    @CacheEvict(value = "reports", allEntries = true)
    public Transaction updateTransaction(Long id, Transaction transactionDetails, User user) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found or does not belong to user"));

        if (transaction.isFinalized()) {
            throw new RuntimeException("Cannot update a finalized transaction");
        }

        // Validate that at least one of credit or debit is non-zero
        BigDecimal creditToSet = transactionDetails.getCredit();
        BigDecimal debitToSet = transactionDetails.getDebit();

        if ((creditToSet == null || creditToSet.compareTo(BigDecimal.ZERO) == 0) &&
                (debitToSet == null || debitToSet.compareTo(BigDecimal.ZERO) == 0)) {
            throw new RuntimeException("Transaction must have either credit or debit amount");
        }

        // Handle Currency Update
        if (transactionDetails.getCurrency() != null) {
            transaction.setCurrency(transactionDetails.getCurrency());
        }
        String currency = transaction.getCurrency();
        if (currency == null) {
            currency = "XAF";
            transaction.setCurrency("XAF");
        }
        final String currentCurrency = currency;

        // Determine the "original amount" provided in the update, or fallback to
        // existing original
        // This logic is tricky on updates. If user updates amount, they are providing
        // it in the transaction's currency.
        BigDecimal safeCredit = creditToSet != null ? creditToSet : BigDecimal.ZERO;
        BigDecimal safeDebit = debitToSet != null ? debitToSet : BigDecimal.ZERO;
        BigDecimal originalAmount = safeCredit.compareTo(BigDecimal.ZERO) > 0 ? safeCredit : safeDebit;
        transaction.setOriginalAmount(originalAmount);

        if (!"XAF".equalsIgnoreCase(currentCurrency)) {
            if (creditToSet != null && creditToSet.compareTo(BigDecimal.ZERO) > 0) {
                creditToSet = currencyService.convert(creditToSet, currentCurrency, "XAF");
            }
            if (debitToSet != null && debitToSet.compareTo(BigDecimal.ZERO) > 0) {
                debitToSet = currencyService.convert(debitToSet, currentCurrency, "XAF");
            }
        }

        if (transactionDetails.getDate() != null) {
            transaction.setDate(transactionDetails.getDate());
        }
        transaction.setUsedFor(transactionDetails.getUsedFor());
        transaction.setCategory(transactionDetails.getCategory());
        transaction.setCredit(creditToSet);
        transaction.setDebit(debitToSet);

        transactionRepository.save(transaction);

        // Trigger cascading update for all following transactions
        recalculateBalances(user);

        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found after save"));
    }

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))
    @CacheEvict(value = "reports", allEntries = true)
    public void deleteTransaction(Long id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found or does not belong to user"));

        if (transaction.isFinalized()) {
            throw new RuntimeException("Cannot delete a finalized transaction");
        }

        transactionRepository.delete(transaction);
        recalculateBalances(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "reports", allEntries = true)
    public MonthlySummary finalizeMonth(User user) {
        List<Transaction> activeTransactions = transactionRepository.findAllByUserAndFinalizedOrderByDateAscIdAsc(user,
                false);

        if (activeTransactions == null || activeTransactions.isEmpty()) {
            throw new RuntimeException("No active transactions found to finalize for this month");
        }

        BigDecimal finalBalance = BigDecimal.ZERO;
        YearMonth summaryMonth = YearMonth.now();

        if (!activeTransactions.isEmpty()) {
            Transaction lastTransaction = activeTransactions.get(activeTransactions.size() - 1);
            finalBalance = lastTransaction.getBalance();
            summaryMonth = YearMonth.from(lastTransaction.getDate());

            // ARCHIVING: Mark all as finalized instead of deleting
            for (Transaction t : activeTransactions) {
                t.setFinalized(true);
            }
            transactionRepository.saveAll(activeTransactions);
        }

        MonthlySummary summary = new MonthlySummary();
        summary.setMonthYear(summaryMonth);
        summary.setClosingBalance(finalBalance);
        summary.setUser(user);

        return monthlySummaryRepository.save(summary);
    }

    @Override
    public BigDecimal getCurrentBalance(User user) {
        // Check last active transaction
        Optional<Transaction> lastTransaction = transactionRepository
                .findTopByUserAndFinalizedOrderByDateDescIdDesc(user, false);
        if (lastTransaction.isPresent()) {
            return lastTransaction.get().getBalance();
        }

        // If no active transactions, fall back to last monthly summary
        return monthlySummaryRepository.findTopByUserOrderByMonthYearDesc(user)
                .map(MonthlySummary::getClosingBalance)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    private void recalculateBalances(User user) {
        List<Transaction> transactions = transactionRepository.findAllByUserAndFinalizedOrderByDateAscIdAsc(user,
                false);

        // Get starting balance from the last finalized summary
        BigDecimal startingBalance = monthlySummaryRepository.findTopByUserOrderByMonthYearDesc(user)
                .map(MonthlySummary::getClosingBalance)
                .orElse(BigDecimal.ZERO);

        BigDecimal currentBalance = startingBalance;

        for (Transaction t : transactions) {
            BigDecimal credit = t.getCredit() != null ? t.getCredit() : BigDecimal.ZERO;
            BigDecimal debit = t.getDebit() != null ? t.getDebit() : BigDecimal.ZERO;

            currentBalance = currentBalance.add(credit).subtract(debit);
            t.setBalance(currentBalance);
        }

        transactionRepository.saveAll(transactions);

        // Low Balance Check: send only on threshold crossing (positive -> <= 0), after
        // commit
        if (startingBalance.compareTo(BigDecimal.ZERO) > 0 && currentBalance.compareTo(BigDecimal.ZERO) <= 0) {
            final BigDecimal finalBalance = currentBalance;
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        emailService.sendLowBalanceAlert(user.getEmail(), finalBalance);
                    } catch (Exception e) {
                        log.error("Failed to send low balance alert for user {}: {}", user.getUsername(),
                                e.getMessage(),
                                e);
                    }
                }
            });
        }
    }

    @Override
    public List<FinalizationLog> getFinalizationHistory(User user) {
        return finalizationLogRepository.findAllByUserOrderByFinalizationDateDesc(user);
    }
}