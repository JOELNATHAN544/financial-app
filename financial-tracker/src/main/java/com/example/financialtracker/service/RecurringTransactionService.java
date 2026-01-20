package com.example.financialtracker.service;

import com.example.financialtracker.model.RecurringTransaction;
import com.example.financialtracker.model.User;
import java.util.List;

public interface RecurringTransactionService {
    RecurringTransaction createRecurring(RecurringTransaction recurring, User user);

    List<RecurringTransaction> getUserRecurring(User user);

    void deleteRecurring(Long id, User user);

    void processRecurringTransactions();
}
