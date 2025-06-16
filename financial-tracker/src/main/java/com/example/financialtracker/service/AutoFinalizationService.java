package com.example.financialtracker.service;

import com.example.financialtracker.model.SystemStatus;
import com.example.financialtracker.model.FinalizationLog;
import com.example.financialtracker.repository.SystemStatusRepository;
import com.example.financialtracker.repository.FinalizationLogRepository;
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
            
            try {
                // Get the closing balance before finalizing
                BigDecimal closingBalance = transactionService.getCurrentBalance();
                
                // Finalize the month
                transactionService.finalizeMonth();
                
                // Create and save the finalization log
                FinalizationLog log = new FinalizationLog();
                log.setFinalizationDate(now);
                log.setMonth(now.getMonthValue());
                log.setYear(now.getYear());
                log.setClosingBalance(closingBalance);
                log.setAutomatic(true);
                finalizationLogRepository.save(log);
                
                // Update last finalization time
                status.setLastFinalization(now);
                systemStatusRepository.save(status);

                // Log the successful finalization
                logger.info("Month automatically finalized for {}/{} with closing balance: {}", 
                    now.getMonthValue(), now.getYear(), closingBalance);
            } catch (Exception e) {
                logger.error("Error during automatic month finalization", e);
            }
        }
    }

    private SystemStatus getOrCreateSystemStatus() {
        SystemStatus status = systemStatusRepository.findFirstByOrderByIdAsc();
        if (status == null) {
            status = new SystemStatus();
            status.setLastFinalization(LocalDateTime.now());
            status = systemStatusRepository.save(status);
        }
        return status;
    }
} 