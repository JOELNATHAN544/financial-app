package com.example.financialtracker.controller;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AuthRequest;
import com.example.financialtracker.payload.AuthResponse;
import com.example.financialtracker.payload.TokenRefreshRequest;
import com.example.financialtracker.service.AuthService;
import com.example.financialtracker.service.RefreshTokenService;
import com.example.financialtracker.model.RefreshToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest authRequest) {
        try {
            if (authRequest.getUsername() == null || authRequest.getUsername().isBlank() ||
                    authRequest.getEmail() == null || authRequest.getEmail().isBlank() ||
                    authRequest.getPassword() == null || authRequest.getPassword().isBlank()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Username, email, and password are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Email format validation
            if (!authRequest.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid email format");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Password complexity validation
            String password = authRequest.getPassword();
            if (password.length() < 8 ||
                    !password.matches(".*[a-zA-Z].*") ||
                    !password.matches(".*\\d.*") ||
                    !password.matches(".*[!@#$%^&*(),.?\":{}|<>\\-_=+\\[\\]\\\\/~`|;:'\"].*")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message",
                        "Password must be at least 8 characters long and contain a combination of letters, numbers, and special characters.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            User user = new User(authRequest.getUsername(), authRequest.getEmail(), authRequest.getPassword());
            AuthResponse authResponse = authService.registerUser(user);

            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest authRequest) {
        try {
            AuthResponse authResponse = authService.authenticateUser(authRequest);
            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = authService.generateAccessToken(user.getUsername());
                    return ResponseEntity.ok(new AuthResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        // Extract username from token if possible, or just delete by token
        refreshTokenService.findByToken(refreshToken).ifPresent(token -> {
            refreshTokenService.deleteByUsername(token.getUser().getUsername());
        });
        return ResponseEntity.ok(Map.of("message", "Log out successful!"));
    }
}