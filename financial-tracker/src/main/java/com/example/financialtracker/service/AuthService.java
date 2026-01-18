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
    private EmailService emailService;

    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername());

        return savedUser;
    }

    public AuthResponse authenticateUser(AuthRequest authRequest) {
        String loginIdentifier = authRequest.getUsername(); // This could be username or email

        try {
            // Try to find user by username or email
            User user = userRepository.findByUsername(loginIdentifier)
                    .or(() -> userRepository.findByEmail(loginIdentifier))
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), authRequest.getPassword()));

            String jwt = jwtUtil.generateToken(user.getUsername());

            // Send login alert email
            emailService.sendLoginAlert(user.getEmail(), user.getUsername());

            return new AuthResponse(jwt);
        } catch (Exception e) {
            // Catch both RuntimeException from orElseThrow and AuthenticationException from
            // authenticate
            throw new RuntimeException("Invalid credentials");
        }
    }
}