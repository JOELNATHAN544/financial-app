package com.example.financialtracker.service;

import com.example.financialtracker.model.MonthlySummary;
import com.example.financialtracker.model.Transaction;
import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.MonthlySummaryRepository;
import com.example.financialtracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private MonthlySummaryRepository monthlySummaryRepository;

    @Mock
    private CurrencyService currencyService;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
    }

    @Test
    void createTransaction_BasicCredit_SavesAndRecalculates() {
        Transaction input = new Transaction();
        input.setCredit(new BigDecimal("1000"));
        input.setCurrency("XAF");
        input.setUsedFor("Salary");

        Transaction savedTx = new Transaction();
        savedTx.setId(1L);
        savedTx.setCredit(new BigDecimal("1000"));
        savedTx.setBalance(new BigDecimal("1000"));

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(savedTx));

        // For recalculation
        when(monthlySummaryRepository.findTopByUserOrderByMonthYearDesc(any())).thenReturn(Optional.empty());
        when(transactionRepository.findAllByUserAndFinalizedOrderByDateAscIdAsc(any(), eq(false)))
                .thenReturn(List.of(savedTx));

        Transaction result = transactionService.createTransaction(input, testUser);

        assertNotNull(result);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(transactionRepository, times(1)).saveAll(anyList());
    }

    @Test
    void createTransaction_WithCurrencyConversion_ConvertsAmount() {
        Transaction input = new Transaction();
        input.setDebit(new BigDecimal("10")); // 10 USD
        input.setCurrency("USD");
        input.setUsedFor("Lunch");

        BigDecimal convertedAmount = new BigDecimal("6000"); // 10 USD = ~6000 XAF
        when(currencyService.convert(any(), eq("USD"), eq("XAF"))).thenReturn(convertedAmount);

        Transaction savedTx = new Transaction();
        savedTx.setId(1L);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(savedTx));
        // Mock Empty list for recalculation to avoid NPE if logic iterates
        when(transactionRepository.findAllByUserAndFinalizedOrderByDateAscIdAsc(any(), eq(false)))
                .thenReturn(new ArrayList<>());

        transactionService.createTransaction(input, testUser);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());

        Transaction captured = captor.getValue();
        assertEquals("USD", captured.getCurrency());
        assertEquals(new BigDecimal("10"), captured.getOriginalAmount());
        // Verify conversion logic was applied to the main debit field
        assertEquals(convertedAmount, captured.getDebit());
    }

    @Test
    void getCurrentBalance_CalculatesCorrectly() {
        Transaction tx1 = new Transaction();
        tx1.setBalance(new BigDecimal("5000"));

        when(transactionRepository.findTopByUserAndFinalizedOrderByDateDescIdDesc(eq(testUser), eq(false)))
                .thenReturn(Optional.of(tx1));

        BigDecimal result = transactionService.getCurrentBalance(testUser);

        assertEquals(new BigDecimal("5000"), result);
    }
}
