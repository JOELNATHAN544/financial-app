package com.example.financialtracker.config;

import com.example.financialtracker.model.User;
import com.example.financialtracker.payload.AuthResponse;
import com.example.financialtracker.repository.UserRepository;
import com.example.financialtracker.service.RefreshTokenService;
import com.example.financialtracker.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class RestAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            // Basic JIT Provisioning
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                // Use email prefix as username, ensure uniqueness in real app logic handling
                String baseUsername = email.split("@")[0];
                newUser.setUsername(baseUsername);
                // Set a dummy password for OAuth users (cannot login via password unless set)
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

                // Handle duplicate username edge case simply for now
                if (userRepository.findByUsername(baseUsername).isPresent()) {
                    newUser.setUsername(baseUsername + "_" + UUID.randomUUID().toString().substring(0, 4));
                }

                return userRepository.save(newUser);
            });
            username = user.getUsername();
        } else if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            throw new IllegalStateException("Unexpected principal type: " + principal.getClass());
        }

        String jwt = jwtUtil.generateToken(username);
        String refreshToken = refreshTokenService.createRefreshToken(username).getToken();

        AuthResponse authResponse = new AuthResponse(jwt, refreshToken);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(authResponse));
    }
}