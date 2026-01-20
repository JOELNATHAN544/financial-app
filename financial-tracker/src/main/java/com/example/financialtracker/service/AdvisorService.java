package com.example.financialtracker.service;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AdvisorInsightsResponse;

public interface AdvisorService {
    AdvisorInsightsResponse getInsights(User user);
}
