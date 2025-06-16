package com.example.financialtracker.payload;

public class AuthResponse {
    private String jwt;

    // No-argument constructor for JSON serialization
    public AuthResponse() {
    }

    public AuthResponse(String jwt) {
        this.jwt = jwt;
    }

    public String getJwt() {
        return jwt;
    }

    public void setJwt(String jwt) {
        this.jwt = jwt;
    }
} 