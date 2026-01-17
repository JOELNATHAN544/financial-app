package com.example.financialtracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.YearMonth;

@Entity
@Table(name = "monthly_summaries")
public class MonthlySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private YearMonth monthYear;

    @Column(nullable = false)
    private BigDecimal closingBalance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // You can add more fields here later if needed, e.g., totalCredit, totalDebit
    // for the month

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public YearMonth getMonthYear() {
        return monthYear;
    }

    public void setMonthYear(YearMonth monthYear) {
        this.monthYear = monthYear;
    }

    public BigDecimal getClosingBalance() {
        return closingBalance;
    }

    public void setClosingBalance(BigDecimal closingBalance) {
        this.closingBalance = closingBalance;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}