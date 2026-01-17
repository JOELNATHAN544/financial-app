package com.example.financialtracker.controller;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AuthRequest;
import com.example.financialtracker.payload.AuthResponse;
import com.example.financialtracker.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest authRequest) {
        try {
            User user = new User(authRequest.getUsername(), authRequest.getPassword());
            User registeredUser = authService.registerUser(user);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("username", registeredUser.getUsername());
            response.put("message", "User registered successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@RequestBody AuthRequest authRequest) {
        AuthResponse authResponse = authService.authenticateUser(authRequest);
        return ResponseEntity.ok(authResponse);
    }
}