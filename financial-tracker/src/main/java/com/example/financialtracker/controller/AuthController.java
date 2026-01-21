package com.example.financialtracker.controller;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AuthRequest;
import com.example.financialtracker.payload.AuthResponse;
import com.example.financialtracker.payload.TokenRefreshRequest;
import com.example.financialtracker.service.AuthService;
import com.example.financialtracker.service.RefreshTokenService;
import com.example.financialtracker.model.RefreshToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

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
            authService.registerUser(user);

            return ResponseEntity
                    .ok(Map.of("message", "Registration successful. Please check your email for verification code."));
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String code = request.get("code");

        if (username == null || username.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and verification code are required"));
        }

        try {
            authService.verifyEmail(username, code);
            return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now login."));
        } catch (RuntimeException e) {
            log.warn("Email verification failed for user {}: {}", username, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest authRequest,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            String deviceDetails = request.getHeader("User-Agent");
            if (deviceDetails == null)
                deviceDetails = "Unknown Device";

            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = request.getRemoteAddr();
            }

            AuthResponse authResponse = authService.authenticateUser(authRequest, deviceDetails, ipAddress);
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

        // Validate refresh token
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
        }

        // Delete only this specific token (per-device logout)
        refreshTokenService.deleteByToken(refreshToken);

        return ResponseEntity.ok(Map.of("message", "Log out successful!"));
    }

    @PostMapping("/request-deletion")
    public ResponseEntity<?> requestDeletion(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        authService.requestAccountDeletion(username);
        return ResponseEntity.ok(Map.of("message", "Verification code sent to email"));
    }

    @PostMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String code = request.get("code");

        if (username == null || username.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request parameters"));
        }

        try {
            authService.deleteAccount(username, code, password);
            return ResponseEntity.ok(Map.of("message", "Account successfully deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete account for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal error occurred while processing your request"));
        }
    }
}