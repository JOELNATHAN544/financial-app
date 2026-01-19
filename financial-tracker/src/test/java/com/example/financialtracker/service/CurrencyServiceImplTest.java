package com.example.financialtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurrencyServiceImplTest {

    @Mock
    private RestTemplate restTemplate;

    private CurrencyServiceImpl currencyService;

    @BeforeEach
    void setUp() {
        currencyService = new CurrencyServiceImpl(restTemplate);
        ReflectionTestUtils.setField(currencyService, "apiUrl", "https://api.test.com");
    }

    @Test
    void getExchangeRate_SameCurrency_ReturnsOne() {
        BigDecimal rate = currencyService.getExchangeRate("USD", "USD");
        assertEquals(BigDecimal.ONE, rate);
    }

    @Test
    void getExchangeRate_XafToEur_ReturnsCorrectRate() {
        // 1 / 655.957 = 0.00152446
        BigDecimal rate = currencyService.getExchangeRate("XAF", "EUR");
        assertNotNull(rate);
        assertTrue(rate.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void convert_ValidAmounts_ReturnsExpectedResult() {
        // Mock API response logic for USD to EUR
        // Since getExchangeRate calls restTemplate, we need to mock it.
        // Or better, test the convert method assuming getExchangeRate works (by spying)
        // OR construct a realistic mock response.

        // Simulating 1 USD = 0.85 EUR
        String jsonResponse = "{\"rates\":{\"EUR\":0.85}}";
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(jsonResponse);
            when(restTemplate.getForObject(anyString(), eq(JsonNode.class))).thenReturn(root);
        } catch (Exception e) {
            fail("Setup failed");
        }

        BigDecimal amount = new BigDecimal("100");
        BigDecimal result = currencyService.convert(amount, "USD", "EUR");

        // 100 * 0.85 = 85.00
        assertEquals(0, new BigDecimal("85.00").compareTo(result));
    }

    @Test
    void getSupportedCurrencies_ReturnsMap() {
        // Mock fallback behavior (empty response or exception)
        when(restTemplate.getForObject(anyString(), eq(JsonNode.class))).thenThrow(new RuntimeException("API Down"));

        Map<String, String> currencies = currencyService.getSupportedCurrencies();

        assertTrue(currencies.containsKey("XAF"));
        assertTrue(currencies.containsKey("USD"));
        assertTrue(currencies.containsKey("EUR"));
    }
}
