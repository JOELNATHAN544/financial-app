package com.example.financialtracker.service;

import java.math.BigDecimal;
import java.util.Map;

public interface CurrencyService {
    BigDecimal getExchangeRate(String from, String to);

    Map<String, String> getSupportedCurrencies();

    BigDecimal convert(BigDecimal amount, String from, String to);
}
