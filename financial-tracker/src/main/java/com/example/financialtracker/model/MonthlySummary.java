package com.example.financialtracker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.YearMonth;

@Entity
@Data
@Table(name = "monthly_summaries")
public class MonthlySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private YearMonth monthYear;

    @Column(nullable = false)
    private BigDecimal closingBalance;

    // You can add more fields here later if needed, e.g., totalCredit, totalDebit for the month
} 