package com.example.financialtracker.repository;

import com.example.financialtracker.model.Budget;
import com.example.financialtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findAllByUserAndMonthAndYear(User user, Integer month, Integer year);

    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, String category, Integer month, Integer year);
}
