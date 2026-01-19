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
import com.example.financialtracker.service.CurrencyService;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
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

    @Autowired
    private CurrencyService currencyService;

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

        BigDecimal originalAmount = credit.compareTo(BigDecimal.ZERO) > 0 ? credit : debit;
        transaction.setOriginalAmount(originalAmount);

        if (!"XAF".equalsIgnoreCase(currency)) {
            // Convert to XAF for storage in credit/debit columns
            if (credit.compareTo(BigDecimal.ZERO) > 0) {
                transaction.setCredit(currencyService.convert(credit, currency, "XAF"));
            }
            if (debit.compareTo(BigDecimal.ZERO) > 0) {
                transaction.setDebit(currencyService.convert(debit, currency, "XAF"));
            }
        }

        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }
        transaction.setUser(user);
        transaction.setFinalized(false);
        transaction.setBalance(java.math.BigDecimal.ZERO); // Temporary balance to satisfy NOT NULL constraint

        // Initial save to get an ID
        Transaction saved = transactionRepository.save(transaction);

        // Recalculate all balances to ensure consistency, especially if adding to a
        // past date
        recalculateBalances(user);

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
        BigDecimal creditToSet = transactionDetails.getCredit() != null ? transactionDetails.getCredit()
                : transaction.getCredit();
        BigDecimal debitToSet = transactionDetails.getDebit() != null ? transactionDetails.getDebit()
                : transaction.getDebit();

        if ((creditToSet == null || creditToSet.compareTo(BigDecimal.ZERO) == 0) &&
                (debitToSet == null || debitToSet.compareTo(BigDecimal.ZERO) == 0)) {
            throw new RuntimeException("Transaction must have either credit or debit amount");
        }

        // Handle Currency Update
        if (transactionDetails.getCurrency() != null) {
            transaction.setCurrency(transactionDetails.getCurrency());
        }
        String currency = transaction.getCurrency(); // New or existing

        // Determine the "original amount" provided in the update, or fallback to
        // existing original
        // This logic is tricky on updates. If user updates amount, they are providing
        // it in the transaction's currency.
        BigDecimal originalAmount = creditToSet.compareTo(BigDecimal.ZERO) > 0 ? creditToSet : debitToSet;
        transaction.setOriginalAmount(originalAmount);

        if (!"XAF".equalsIgnoreCase(currency)) {
            if (creditToSet != null && creditToSet.compareTo(BigDecimal.ZERO) > 0) {
                creditToSet = currencyService.convert(creditToSet, currency, "XAF");
            }
            if (debitToSet != null && debitToSet.compareTo(BigDecimal.ZERO) > 0) {
                debitToSet = currencyService.convert(debitToSet, currency, "XAF");
            }
        }

        if (transactionDetails.getDate() != null) {
            transaction.setDate(transactionDetails.getDate());
        }
        transaction.setUsedFor(transactionDetails.getUsedFor());
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

        if (activeTransactions.isEmpty()) {
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
        BigDecimal currentBalance = monthlySummaryRepository.findTopByUserOrderByMonthYearDesc(user)
                .map(MonthlySummary::getClosingBalance)
                .orElse(BigDecimal.ZERO);

        for (Transaction t : transactions) {
            BigDecimal credit = t.getCredit() != null ? t.getCredit() : BigDecimal.ZERO;
            BigDecimal debit = t.getDebit() != null ? t.getDebit() : BigDecimal.ZERO;

            currentBalance = currentBalance.add(credit).subtract(debit);
            t.setBalance(currentBalance);
        }

        transactionRepository.saveAll(transactions);
    }

    @Override
    public List<FinalizationLog> getFinalizationHistory(User user) {
        return finalizationLogRepository.findAllByUserOrderByFinalizationDateDesc(user);
    }
}