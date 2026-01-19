package com.example.financialtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

@Service
public class CurrencyServiceImpl implements CurrencyService {

    private static final Logger logger = LoggerFactory.getLogger(CurrencyServiceImpl.class);

    @Value("${app.currency.api-url:https://api.frankfurter.app}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    @Autowired
    public CurrencyServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    @Cacheable(value = "rates", key = "#from + '-' + #to")
    public BigDecimal getExchangeRate(String from, String to) {
        if (from.equals(to)) {
            return BigDecimal.ONE;
        }

        // Handle XAF (FCFA) which is pegged to EUR (1 EUR = 655.957 XAF)
        if ("XAF".equals(from)) {
            // XAF -> TO = (XAF -> EUR) * (EUR -> TO)
            // XAF -> EUR = 1 / 655.957
            BigDecimal xafToEur = BigDecimal.ONE.divide(BigDecimal.valueOf(655.957), 10, RoundingMode.HALF_UP);
            if ("EUR".equals(to))
                return xafToEur;
            return xafToEur.multiply(getExchangeRate("EUR", to));
        }

        if ("XAF".equals(to)) {
            // FROM -> XAF = (FROM -> EUR) * (EUR -> XAF)
            BigDecimal eurToXaf = BigDecimal.valueOf(655.957);
            if ("EUR".equals(from))
                return eurToXaf;
            return getExchangeRate(from, "EUR").multiply(eurToXaf);
        }

        String url = String.format("%s/latest?from=%s&to=%s", apiUrl, from, to);
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response != null && response.has("rates")) {
                // Use new BigDecimal(String) to avoid precision loss from double
                return new BigDecimal(response.get("rates").get(to).asText());
            }
        } catch (Exception e) {
            logger.error("Error fetching exchange rate from {} to {}: {}", from, to, e.getMessage());
        }
        throw new RuntimeException("Unable to fetch exchange rate for " + from + " to " + to);
    }

    @Override
    @Cacheable(value = "currencies")
    public Map<String, String> getSupportedCurrencies() {
        String url = String.format("%s/currencies", apiUrl);
        Map<String, String> currencies = new TreeMap<>();
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response != null) {
                Iterator<String> fieldNames = response.fieldNames();
                while (fieldNames.hasNext()) {
                    String code = fieldNames.next();
                    currencies.put(code, response.get(code).asText());
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching currencies: {}", e.getMessage());
        }

        // Add XAF manually if not present
        if (!currencies.containsKey("XAF")) {
            currencies.put("XAF", "Central African CFA Franc");
        }

        // Fallback for offline dev
        if (currencies.isEmpty()) {
            currencies.put("USD", "United States Dollar");
            currencies.put("EUR", "Euro");
            currencies.put("GBP", "British Pound");
            currencies.put("XAF", "Central African CFA Franc");
        }
        return currencies;
    }

    @Override
    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (amount == null)
            return BigDecimal.ZERO;
        BigDecimal rate = getExchangeRate(from, to);
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }
}
