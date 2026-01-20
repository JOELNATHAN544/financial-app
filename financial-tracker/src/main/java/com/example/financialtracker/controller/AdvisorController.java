package com.example.financialtracker.controller;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AdvisorInsightsResponse;
import com.example.financialtracker.service.AdvisorService;
import com.example.financialtracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/advisor")
public class AdvisorController {

    @Autowired
    private AdvisorService advisorService;

    @Autowired
    private UserService userService;

    @GetMapping("/insights")
    public ResponseEntity<AdvisorInsightsResponse> getInsights(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(advisorService.getInsights(user));
    }
}
