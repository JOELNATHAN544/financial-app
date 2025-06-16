package com.example.financialtracker.service;

import com.example.financialtracker.model.SystemStatus;
import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.repository.SystemStatusRepository;
import com.example.financialtracker.repository.FinalizationLogRepository;
import com.example.financialtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Service
public class AutoFinalizationService {
    private static final Logger logger = LoggerFactory.getLogger(AutoFinalizationService.class);

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private SystemStatusRepository systemStatusRepository;

    @Autowired
    private FinalizationLogRepository finalizationLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    @Transactional
    public void checkAndFinalizeMonth() {
        SystemStatus status = getOrCreateSystemStatus();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastFinalization = status.getLastFinalization();

        // Check if we need to finalize (if it's the first day of the month and we haven't finalized yet)
        if (now.getDayOfMonth() == 1 && 
            (lastFinalization == null || 
             lastFinalization.getMonth() != now.getMonth() || 
             lastFinalization.getYear() != now.getYear())) {
            
            // Iterate over all users and finalize month for each
            userRepository.findAll().forEach(user -> {
                try {
                    // Get the closing balance before finalizing
                    BigDecimal closingBalance = transactionService.getCurrentBalance(user);
                    
                    // Finalize the month
                    transactionService.finalizeMonth(user);
                    
                    // Create and save the finalization log for the specific user
                    FinalizationLog log = new FinalizationLog();
                    log.setFinalizationDate(now);
                    log.setMonth(now.getMonthValue());
                    log.setYear(now.getYear());
                    log.setClosingBalance(closingBalance);
                    log.setAutomatic(true);
                    log.setUser(user); // Associate the log with the user
                    finalizationLogRepository.save(log);
                    
                    logger.info("Month automatically finalized for user {} (ID: {}) for {}/{} with closing balance: {}", 
                        user.getUsername(), user.getId(), now.getMonthValue(), now.getYear(), closingBalance);
                } catch (Exception e) {
                    logger.error("Error during automatic month finalization for user {} (ID: {}): {}", 
                        user.getUsername(), user.getId(), e.getMessage(), e);
                }
            });
            
            // Update last finalization time after all users have been processed
            status.setLastFinalization(now);
            systemStatusRepository.save(status);

        } else {
            logger.info("Skipping automatic month finalization. Current date: {}, Last finalization: {}", now.toLocalDate(), lastFinalization != null ? lastFinalization.toLocalDate() : "N/A");
        }
    }

    private SystemStatus getOrCreateSystemStatus() {
        SystemStatus status = systemStatusRepository.findFirstByOrderByIdAsc();
        if (status == null) {
            status = new SystemStatus();
            status.setLastFinalization(LocalDateTime.now()); // Set initial last finalization to now
            status = systemStatusRepository.save(status);
        }
        return status;
    }
} 