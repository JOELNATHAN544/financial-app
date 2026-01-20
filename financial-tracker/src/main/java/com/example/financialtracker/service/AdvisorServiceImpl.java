package com.example.financialtracker.service;

import com.example.financialtracker.model.RecurringTransaction;
import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AdvisorInsightsResponse;
import com.example.financialtracker.repository.RecurringTransactionRepository;
import com.example.financialtracker.repository.TransactionRepository;
import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdvisorServiceImpl implements AdvisorService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;

    @Override
    @Cacheable(value = "reports", key = "#user.username + '-advisor'")
    public AdvisorInsightsResponse getInsights(User user) {
        List<Transaction> transactions = transactionRepository.findAllByUserOrderByDateAscIdAsc(user);

        // 1. Calculate Forecast
        List<AdvisorInsightsResponse.ForecastDataPoint> forecast = calculateForecast(user, transactions);

        // 2. Anomaly Detection & Advice
        List<String> advice = generateAdvice(user, transactions);

        // 3. Stats
        AdvisorInsightsResponse.SummaryStats stats = calculateStats(forecast, transactions);

        return new AdvisorInsightsResponse(forecast, advice, stats);
    }

    private List<AdvisorInsightsResponse.ForecastDataPoint> calculateForecast(User user,
            List<Transaction> transactions) {
        List<AdvisorInsightsResponse.ForecastDataPoint> result = new ArrayList<>();
        if (transactions.isEmpty())
            return result;

        LocalDate today = LocalDate.now();

        // Use historical data for the regression (last 60 days)
        SimpleRegression regression = new SimpleRegression();
        LocalDate sixtyDaysAgo = today.minusDays(60);

        for (Transaction t : transactions) {
            if (t.getDate().isAfter(sixtyDaysAgo) && t.getBalance() != null) {
                regression.addData(ChronoUnit.DAYS.between(sixtyDaysAgo, t.getDate()), t.getBalance().doubleValue());
            }
        }

        // Project next 30 days
        BigDecimal lastBalance = transactions.get(transactions.size() - 1).getBalance();

        // Add last 5 days of history for context in the chart
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            BigDecimal b = findBalanceOnDate(transactions, d);
            result.add(new AdvisorInsightsResponse.ForecastDataPoint(d.toString(), b, false));
        }

        // Calculate known upcoming expenses from recurring transactions
        List<RecurringTransaction> recurring = recurringTransactionRepository.findAllByUserAndActive(user, true);

        for (int i = 1; i <= 30; i++) {
            LocalDate futureDate = today.plusDays(i);
            long daysFromStart = ChronoUnit.DAYS.between(sixtyDaysAgo, futureDate);

            double predictedValue = regression.predict(daysFromStart);
            if (Double.isNaN(predictedValue))
                predictedValue = lastBalance.doubleValue();

            // Recurring transaction logic removed as per PR feedback (dead code)
            BigDecimal adjustedValue = new BigDecimal(predictedValue);

            result.add(new AdvisorInsightsResponse.ForecastDataPoint(
                    futureDate.toString(),
                    adjustedValue.setScale(2, RoundingMode.HALF_UP),
                    true));
        }

        return result;
    }

    private List<String> generateAdvice(User user, List<Transaction> transactions) {
        List<String> advice = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        // Category Analysis
        Map<String, BigDecimal> currentMonthSpending = transactions.stream()
                .filter(t -> !t.getDate().isBefore(startOfMonth) && t.getDebit() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory() : "Others",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getDebit, BigDecimal::add)));

        // 3-Month Average (Simple version)
        LocalDate threeMonthsAgo = today.minusMonths(3).withDayOfMonth(1);
        Map<String, BigDecimal> historicSpending = transactions.stream()
                .filter(t -> t.getDate().isAfter(threeMonthsAgo) && t.getDate().isBefore(startOfMonth)
                        && t.getDebit() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory() : "Others",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getDebit, BigDecimal::add)));

        for (Map.Entry<String, BigDecimal> entry : currentMonthSpending.entrySet()) {
            String category = entry.getKey();
            BigDecimal current = entry.getValue();
            BigDecimal historicAvg = historicSpending.getOrDefault(category, BigDecimal.ZERO)
                    .divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);

            if (historicAvg.compareTo(BigDecimal.ZERO) > 0) {
                if (current.compareTo(historicAvg.multiply(new BigDecimal("1.3"))) > 0) {
                    advice.add("Warning: Your '" + category
                            + "' spending is significantly higher than your average. Consider slowing down!");
                } else if (current.compareTo(historicAvg.multiply(new BigDecimal("0.7"))) < 0) {
                    advice.add("Great job! You've saved quite a bit on '" + category + "' this month.");
                }
            }
        }

        if (advice.isEmpty()) {
            advice.add("Your spending habits seem stable this month. Keep it up!");
        }

        return advice;
    }

    private AdvisorInsightsResponse.SummaryStats calculateStats(
            List<AdvisorInsightsResponse.ForecastDataPoint> forecast, List<Transaction> transactions) {
        BigDecimal endBalance = forecast.isEmpty() ? BigDecimal.ZERO : forecast.get(forecast.size() - 1).getBalance();

        // Calculate average daily spending in the last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        BigDecimal totalSpent = transactions.stream()
                .filter(t -> t.getDate().isAfter(thirtyDaysAgo) && t.getDebit() != null)
                .map(Transaction::getDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgDaily = totalSpent.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);

        String trend = "STABLE";
        if (!forecast.isEmpty()) {
            BigDecimal start = forecast.get(0).getBalance();
            if (endBalance.compareTo(start.multiply(new BigDecimal("1.05"))) > 0)
                trend = "UP";
            else if (endBalance.compareTo(start.multiply(new BigDecimal("0.95"))) < 0)
                trend = "DOWN";
        }

        return new AdvisorInsightsResponse.SummaryStats(endBalance, avgDaily, trend);
    }

    private BigDecimal findBalanceOnDate(List<Transaction> transactions, LocalDate date) {
        return transactions.stream()
                .filter(t -> !t.getDate().isAfter(date))
                .reduce((first, second) -> second) // Get last transaction on or before date
                .map(Transaction::getBalance)
                .orElse(BigDecimal.ZERO);
    }
}
