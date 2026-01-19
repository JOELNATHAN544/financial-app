package com.example.financialtracker.repository;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT t.usedFor, SUM(t.debit) FROM Transaction t WHERE t.user = :user AND t.debit > 0 AND t.date BETWEEN :startDate AND :endDate GROUP BY t.usedFor")
    List<Object[]> findExpensesByCategory(@Param("user") User user, @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT t.date, SUM(t.debit) FROM Transaction t WHERE t.user = :user AND t.debit > 0 AND t.date BETWEEN :startDate AND :endDate GROUP BY t.date ORDER BY t.date ASC")
    List<Object[]> findDailyExpenses(@Param("user") User user, @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);

    List<Transaction> findAllByUserOrderByDateAscIdAsc(User user);

    List<Transaction> findAllByUserAndFinalizedOrderByDateAscIdAsc(User user, boolean finalized);

    Optional<Transaction> findTopByUserAndFinalizedOrderByDateDescIdDesc(User user, boolean finalized);

    Optional<Transaction> findByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);

    void deleteAllByUserAndFinalized(User user, boolean finalized);
}