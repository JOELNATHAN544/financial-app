package com.example.financialtracker.payload;

import java.math.BigDecimal;
import java.util.List;

public class AdvisorInsightsResponse {
    private List<ForecastDataPoint> balanceForecast;
    private List<String> advice;
    private SummaryStats stats;

    public AdvisorInsightsResponse() {
    }

    public AdvisorInsightsResponse(List<ForecastDataPoint> balanceForecast, List<String> advice, SummaryStats stats) {
        this.balanceForecast = balanceForecast;
        this.advice = advice;
        this.stats = stats;
    }

    public List<ForecastDataPoint> getBalanceForecast() {
        return balanceForecast;
    }

    public void setBalanceForecast(List<ForecastDataPoint> balanceForecast) {
        this.balanceForecast = balanceForecast;
    }

    public List<String> getAdvice() {
        return advice;
    }

    public void setAdvice(List<String> advice) {
        this.advice = advice;
    }

    public SummaryStats getStats() {
        return stats;
    }

    public void setStats(SummaryStats stats) {
        this.stats = stats;
    }

    public static class ForecastDataPoint {
        private String date;
        private BigDecimal balance;
        private boolean projected;

        public ForecastDataPoint() {
        }

        public ForecastDataPoint(String date, BigDecimal balance, boolean projected) {
            this.date = date;
            this.balance = balance;
            this.projected = projected;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(BigDecimal balance) {
            this.balance = balance;
        }

        public boolean isProjected() {
            return projected;
        }

        public void setProjected(boolean projected) {
            this.projected = projected;
        }
    }

    public static class SummaryStats {
        private BigDecimal projectedEndOfMonthBalance;
        private BigDecimal averageDailySpending;
        private String spendingTrend;

        public SummaryStats() {
        }

        public SummaryStats(BigDecimal projectedEndOfMonthBalance, BigDecimal averageDailySpending,
                String spendingTrend) {
            this.projectedEndOfMonthBalance = projectedEndOfMonthBalance;
            this.averageDailySpending = averageDailySpending;
            this.spendingTrend = spendingTrend;
        }

        public BigDecimal getProjectedEndOfMonthBalance() {
            return projectedEndOfMonthBalance;
        }

        public void setProjectedEndOfMonthBalance(BigDecimal projectedEndOfMonthBalance) {
            this.projectedEndOfMonthBalance = projectedEndOfMonthBalance;
        }

        public BigDecimal getAverageDailySpending() {
            return averageDailySpending;
        }

        public void setAverageDailySpending(BigDecimal averageDailySpending) {
            this.averageDailySpending = averageDailySpending;
        }

        public String getSpendingTrend() {
            return spendingTrend;
        }

        public void setSpendingTrend(String spendingTrend) {
            this.spendingTrend = spendingTrend;
        }
    }
}
