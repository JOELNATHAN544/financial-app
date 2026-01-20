package com.example.financialtracker.service;

import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.UserRepository;
import com.example.financialtracker.payload.AuthRequest;
import com.example.financialtracker.payload.AuthResponse;
import com.example.financialtracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EmailService emailService;

    public AuthResponse registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        // Send welcome email - wrap in try-catch to avoid blocking registration on
        // email failure
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername());
        } catch (Exception e) {
            // Log error but don't fail registration
        }

        String jwt = jwtUtil.generateToken(savedUser.getUsername());
        String refreshToken = refreshTokenService.createRefreshToken(savedUser.getUsername()).getToken();

        return new AuthResponse(jwt, refreshToken);
    }

    public String generateAccessToken(String username) {
        return jwtUtil.generateToken(username);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public AuthResponse authenticateUser(AuthRequest authRequest) {
        String loginIdentifier = authRequest.getUsername(); // This could be username or email

        // 1. User lookup outside the try-catch for authentication
        User user = userRepository.findByUsername(loginIdentifier)
                .or(() -> userRepository.findByEmail(loginIdentifier))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // 2. Check for lockout
        if (!user.isAccountNonLocked()) {
            throw new RuntimeException(
                    "Account is locked due to multiple failed login attempts. Please try again later.");
        }

        // 3. Wrap only the authentication call to handle credential failures
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), authRequest.getPassword()));

            // Success: Reset failed attempts
            user.setFailedLoginAttempts(0);
            user.setLockoutExpiry(null);
            userRepository.save(user);

        } catch (org.springframework.security.core.AuthenticationException e) {
            // Failure: Increment attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= 5) {
                user.setLockoutExpiry(java.time.LocalDateTime.now().plusMinutes(30));
                userRepository.save(user);
                try {
                    emailService.sendSimpleMessage(
                            user.getEmail(),
                            "Account Locked",
                            "Your account has been locked for 30 minutes due to 5 consecutive failed login attempts.");
                } catch (Exception ex) {
                    // Log but don't block
                }
                throw new RuntimeException(
                        "Account is locked due to multiple failed login attempts. Please try again later.");
            }

            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }

        // 4. Generate JWT after successful authentication
        String jwt = jwtUtil.generateToken(user.getUsername());

        // 5. Create Refresh Token
        String refreshToken = refreshTokenService.createRefreshToken(user.getUsername()).getToken();

        // 6. Send login alert email - wrap in try-catch
        try {
            emailService.sendLoginAlert(user.getEmail(), user.getUsername());
        } catch (Exception e) {
            // Log but don't block
        }

        return new AuthResponse(jwt, refreshToken);
    }
}