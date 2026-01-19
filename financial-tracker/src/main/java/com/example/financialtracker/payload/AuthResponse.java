package com.example.financialtracker.payload;

public class AuthResponse {
    private String jwt;
    private String refreshToken;

    // No-argument constructor for JSON serialization
    public AuthResponse() {
    }

    public AuthResponse(String jwt, String refreshToken) {
        this.jwt = jwt;
        this.refreshToken = refreshToken;
    }

    public String getJwt() {
        return jwt;
    }

    public void setJwt(String jwt) {
        this.jwt = jwt;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}