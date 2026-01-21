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
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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

    public void registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Generate Verification Code
        String code = String.format("%06d", new java.security.SecureRandom().nextInt(999999));
        user.setVerificationCode(code);
        user.setEnabled(false); // Disable until verified

        User savedUser = userRepository.save(user);

        // Send Verification Email
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), code);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", savedUser.getEmail(), e.getMessage());
        }
        // Function now returns void as we don't issue tokens on registration anymore
    }

    public void verifyEmail(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            return; // Already verified
        }

        if (code == null || !code.equals(user.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        // Send welcome email AFTER verification
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        } catch (Exception e) {
            // ignore
        }
    }

    public String generateAccessToken(String username) {
        return jwtUtil.generateToken(username);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    @Autowired
    private com.example.financialtracker.repository.UserDeviceRepository userDeviceRepository;

    @Transactional
    public AuthResponse authenticateUser(AuthRequest authRequest, String deviceDetails, String ipAddress) {
        String loginIdentifier = authRequest.getUsername(); // This could be username or email

        // 1. User lookup outside the try-catch for authentication
        User user = userRepository.findByUsername(loginIdentifier)
                .or(() -> userRepository.findByEmail(loginIdentifier))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // 1.1 Check Enabled Status
        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please check your email for the verification code.");
        }

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
                    log.error("Failed to send lockout email to {}: {}", user.getEmail(), ex.getMessage());
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

        // 6. Device Tracking & Alerting
        try {
            String deviceHash = Integer.toHexString((deviceDetails + ipAddress).hashCode()); // Simple hash
            var existingDevice = userDeviceRepository.findByUserAndDeviceHash(user, deviceHash);

            if (existingDevice.isPresent()) {
                var device = existingDevice.get();
                device.setLastLogin(java.time.LocalDateTime.now());
                userDeviceRepository.save(device);
            } else {
                // New Device Detected
                var newDevice = new com.example.financialtracker.model.UserDevice(
                        user, deviceHash,
                        deviceDetails.length() > 50 ? deviceDetails.substring(0, 50) + "..." : deviceDetails,
                        java.time.LocalDateTime.now());
                userDeviceRepository.save(newDevice);

                emailService.sendNewDeviceLoginAlert(
                        user.getEmail(),
                        user.getUsername(),
                        deviceDetails + " (IP: " + ipAddress + ")",
                        java.time.LocalDateTime.now().toString());
            }
        } catch (Exception e) {
            log.error("Failed to process device tracking for {}: {}", user.getUsername(), e.getMessage());
        }

        return new AuthResponse(jwt, refreshToken);
    }

    @Autowired
    private UserService userService;

    public void requestAccountDeletion(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String code = String.format("%06d", new java.security.SecureRandom().nextInt(999999));
        user.setDeletionCode(code);
        user.setDeletionCodeExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        try {
            emailService.sendDeletionCode(user.getEmail(), code);
        } catch (Exception e) {
            log.error("Failed to send deletion code: {}", e.getMessage());
        }
    }

    @Transactional
    public void deleteAccount(String username, String code, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify password first (Critical Security)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Verify MFA code
        if (user.getDeletionCode() == null ||
                !user.getDeletionCode().equals(code) ||
                user.getDeletionCodeExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired deletion verification code");
        }

        // Execute deletion
        userService.deleteUser(user);

        try {
            emailService.sendEmail(user.getEmail(), "Account Deleted",
                    "<h1>Goodbye</h1><p>Your account has been successfully deleted.</p>");
        } catch (Exception e) {
            // Ignore
        }
    }
}