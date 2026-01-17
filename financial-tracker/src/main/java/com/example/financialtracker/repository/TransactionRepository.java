package com.example.financialtracker.repository;

import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByUserOrderByDateAscIdAsc(User user);

    List<Transaction> findAllByUserAndFinalizedOrderByDateAscIdAsc(User user, boolean finalized);

    Optional<Transaction> findTopByUserAndFinalizedOrderByDateDescIdDesc(User user, boolean finalized);

    Optional<Transaction> findByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);

    void deleteAllByUserAndFinalized(User user, boolean finalized);
}