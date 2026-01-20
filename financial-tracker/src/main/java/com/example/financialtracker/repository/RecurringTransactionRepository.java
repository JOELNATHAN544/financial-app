package com.example.financialtracker.repository;

import com.example.financialtracker.model.RecurringTransaction;
import com.example.financialtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findAllByUser(User user);

    List<RecurringTransaction> findAllByActiveAndNextRunDateLessThanEqual(boolean active, LocalDate date);
}
