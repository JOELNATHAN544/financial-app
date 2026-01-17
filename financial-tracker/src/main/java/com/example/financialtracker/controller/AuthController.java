package com.example.financialtracker.controller;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AuthRequest;
import com.example.financialtracker.payload.AuthResponse;
import com.example.financialtracker.service.AuthService;
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
            // Expanded special character set as per CodeRabbit suggestion:
            // [!@#$%^&*(),.?":{}|<>\-_=+\\[\\]\\\\/~`|;:'\"]
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
            User registeredUser = authService.registerUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("username", registeredUser.getUsername());
            response.put("email", registeredUser.getEmail());
            response.put("message", "User registered successfully");

            return ResponseEntity.ok(response);
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
}