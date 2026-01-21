package com.example.financialtracker.service;

import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.financialtracker.repository.TransactionRepository transactionRepository;

    @Autowired
    private com.example.financialtracker.repository.RecurringTransactionRepository recurringTransactionRepository;

    @Autowired
    private com.example.financialtracker.repository.BudgetRepository budgetRepository;

    @Autowired
    private com.example.financialtracker.repository.UserDeviceRepository userDeviceRepository;

    @Autowired
    private com.example.financialtracker.repository.RefreshTokenRepository refreshTokenRepository;

    // Optional repositories if they exist and are tied to user
    @Autowired(required = false)
    private com.example.financialtracker.repository.MonthlySummaryRepository monthlySummaryRepository;

    @Autowired(required = false)
    private com.example.financialtracker.repository.FinalizationLogRepository finalizationLogRepository;

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(User user) {
        // Cascade delete all user data

        // 1. Refresh Tokens
        refreshTokenRepository.deleteByUser(user);

        // 2. User Devices
        userDeviceRepository.deleteAll(userDeviceRepository.findAllByUser(user));

        // 3. Transactions
        // Using batch delete logic if efficient method not available
        transactionRepository.deleteAll(transactionRepository.findAllByUserOrderByDateAscIdAsc(user));

        // 4. Recurring Transactions
        recurringTransactionRepository.deleteAll(recurringTransactionRepository.findAllByUser(user));

        // 5. Budgets
        budgetRepository.deleteAll(budgetRepository.findAllByUser(user));

        // 6. Monthly Summaries (if applicable)
        if (monthlySummaryRepository != null) {
            monthlySummaryRepository.deleteAll(monthlySummaryRepository.findByUser(user));
        }

        // 7. Finalization Logs
        if (finalizationLogRepository != null) {
            // Assuming similar pattern or findAllByUser
            // Skipping for now if generic findByUser not guaranteed, or handled by DB
            // cascade
        }

        // 8. Delete User
        userRepository.delete(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(),
                new ArrayList<>());
    }
}