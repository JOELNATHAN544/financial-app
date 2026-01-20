package com.example.financialtracker.service;

import com.example.financialtracker.model.RecurringTransaction;
import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.RecurringTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    @Autowired
    private RecurringTransactionRepository recurringRepository;

    @Autowired
    private TransactionService transactionService;

    @Override
    @Transactional
    public RecurringTransaction createRecurring(RecurringTransaction recurring, User user) {
        recurring.setUser(user);
        if (recurring.getStartDate() == null) {
            recurring.setStartDate(LocalDate.now());
        }
        recurring.setNextRunDate(recurring.getStartDate());
        return recurringRepository.save(recurring);
    }

    @Override
    public List<RecurringTransaction> getUserRecurring(User user) {
        return recurringRepository.findAllByUser(user);
    }

    @Override
    @Transactional
    public void deleteRecurring(Long id, User user) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        RecurringTransaction recurring = recurringRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found"));

        if (!recurring.getUser().equals(user)) {
            throw new RuntimeException("Access denied");
        }
        recurringRepository.delete(recurring);
    }

    @Override
    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions = recurringRepository
                .findAllByActiveAndNextRunDateLessThanEqual(true, today);

        for (RecurringTransaction rt : dueTransactions) {
            if (rt != null) {
                createTransactionFromRecurring(rt);
                updateNextRunDate(rt);
                recurringRepository.save(rt);
            }
        }
    }

    private void createTransactionFromRecurring(RecurringTransaction rt) {
        Transaction t = new Transaction();
        t.setUser(rt.getUser());
        t.setDate(LocalDate.now());
        t.setUsedFor("[Recurring] " + rt.getDescription());
        t.setCategory(rt.getCategory());
        t.setDebit(rt.getAmount());
        t.setCurrency(rt.getCurrency());
        t.setOriginalAmount(rt.getAmount());

        transactionService.createTransaction(t, rt.getUser());
    }

    private void updateNextRunDate(RecurringTransaction rt) {
        LocalDate currentNext = rt.getNextRunDate();
        switch (rt.getFrequency()) {
            case DAILY:
                rt.setNextRunDate(currentNext.plusDays(1));
                break;
            case WEEKLY:
                rt.setNextRunDate(currentNext.plusWeeks(1));
                break;
            case MONTHLY:
                rt.setNextRunDate(currentNext.plusMonths(1));
                break;
            case YEARLY:
                rt.setNextRunDate(currentNext.plusYears(1));
                break;
        }
    }
}
