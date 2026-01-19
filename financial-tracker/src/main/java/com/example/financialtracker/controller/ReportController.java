package com.example.financialtracker.controller;

import com.example.financialtracker.model.User;
import com.example.financialtracker.service.ReportService;
import com.example.financialtracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

    @GetMapping("/expense-by-category")
    public ResponseEntity<List<Map<String, Object>>> getExpensesByCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        User user = userService.findByUsername(userDetails.getUsername());
        LocalDate startDate = getStartDate(month, year);
        LocalDate endDate = getEndDate(startDate);

        List<Map<String, Object>> response = reportService.getExpensesByCategory(user, startDate, endDate);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<List<Map<String, Object>>> getMonthlySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        User user = userService.findByUsername(userDetails.getUsername());
        LocalDate startDate = getStartDate(month, year);
        LocalDate endDate = getEndDate(startDate);

        List<Map<String, Object>> response = reportService.getMonthlySummary(user, startDate, endDate);

        return ResponseEntity.ok(response);
    }

    private LocalDate getStartDate(Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();

        if (m < 1 || m > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month must be between 1 and 12");
        }
        if (y < 2000 || y > 3000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Year must be between 2000 and 3000");
        }

        return LocalDate.of(y, m, 1);
    }

    private LocalDate getEndDate(LocalDate startDate) {
        return startDate.plusMonths(1).minusDays(1);
    }
}
