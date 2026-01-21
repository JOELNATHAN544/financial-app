package com.example.financialtracker.service;

import com.example.financialtracker.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    User findByUsername(String username);

    User save(User user);

    void deleteUser(User user);
}