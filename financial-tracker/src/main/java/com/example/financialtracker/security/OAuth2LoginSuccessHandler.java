package com.example.financialtracker.security;

import com.example.financialtracker.model.User;
import com.example.financialtracker.repository.UserRepository;
import com.example.financialtracker.service.RefreshTokenService;
import com.example.financialtracker.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Check if user exists, if not, create one (password-less social login)
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);

            // Use Google name as basis for username
            String baseUsername = (name != null && !name.isEmpty()) ? name : email.split("@")[0];
            String finalUsername = baseUsername;

            // Handle username collisions
            int count = 1;
            while (userRepository.findByUsername(finalUsername).isPresent()) {
                finalUsername = baseUsername + "_" + count++;
            }

            newUser.setUsername(finalUsername);
            newUser.setPassword("OAUTH2_USER_" + java.util.UUID.randomUUID()); // Random password for security
            return userRepository.save(newUser);
        });

        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = refreshTokenService.createRefreshToken(user.getUsername()).getToken();

        // Redirect back to frontend with tokens
        String targetUrl = "http://localhost:5173/oauth2/callback?token=" + token + "&refreshToken=" + refreshToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
