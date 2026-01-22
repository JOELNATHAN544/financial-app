package com.example.financialtracker.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "lockout_expiry")
    private java.time.LocalDateTime lockoutExpiry;

    @Version
    private Long version;

    @Column(name = "deletion_code")
    private String deletionCode;

    @Column(name = "deletion_code_expiry")
    private java.time.LocalDateTime deletionCodeExpiry;

    @Column(name = "enabled")
    private Boolean enabled = false;

    @Column(name = "verification_code", length = 6)
    private String verificationCode;

    @Column(name = "verification_code_expiry")
    private java.time.LocalDateTime verificationCodeExpiry;

    @Column(name = "verification_resend_count", nullable = false)
    private int verificationResendCount = 0;

    @Column(name = "last_verification_resend_at")
    private java.time.LocalDateTime lastVerificationResendAt;

    @Column(name = "reset_password_code")
    private String resetPasswordCode;

    @Column(name = "reset_password_code_expiry")
    private java.time.LocalDateTime resetPasswordCodeExpiry;

    @Column(name = "reset_password_resend_count", nullable = false)
    private int resetPasswordResendCount = 0;

    @Column(name = "last_reset_password_resend_at")
    private java.time.LocalDateTime lastResetPasswordResendAt;

    @Column(name = "reset_password_code_attempts", nullable = false)
    private int resetPasswordCodeAttempts = 0;

    // Default constructor
    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = false; // Explicitly set to false for new users
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public java.time.LocalDateTime getLockoutExpiry() {
        return lockoutExpiry;
    }

    public void setLockoutExpiry(java.time.LocalDateTime lockoutExpiry) {
        this.lockoutExpiry = lockoutExpiry;
    }

    public String getDeletionCode() {
        return deletionCode;
    }

    public void setDeletionCode(String deletionCode) {
        this.deletionCode = deletionCode;
    }

    public java.time.LocalDateTime getDeletionCodeExpiry() {
        return deletionCodeExpiry;
    }

    public void setDeletionCodeExpiry(java.time.LocalDateTime deletionCodeExpiry) {
        this.deletionCodeExpiry = deletionCodeExpiry;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public java.time.LocalDateTime getVerificationCodeExpiry() {
        return verificationCodeExpiry;
    }

    public void setVerificationCodeExpiry(java.time.LocalDateTime verificationCodeExpiry) {
        this.verificationCodeExpiry = verificationCodeExpiry;
    }

    public int getVerificationResendCount() {
        return verificationResendCount;
    }

    public void setVerificationResendCount(int verificationResendCount) {
        this.verificationResendCount = verificationResendCount;
    }

    public java.time.LocalDateTime getLastVerificationResendAt() {
        return lastVerificationResendAt;
    }

    public void setLastVerificationResendAt(java.time.LocalDateTime lastVerificationResendAt) {
        this.lastVerificationResendAt = lastVerificationResendAt;
    }

    public String getResetPasswordCode() {
        return resetPasswordCode;
    }

    public void setResetPasswordCode(String resetPasswordCode) {
        this.resetPasswordCode = resetPasswordCode;
    }

    public java.time.LocalDateTime getResetPasswordCodeExpiry() {
        return resetPasswordCodeExpiry;
    }

    public void setResetPasswordCodeExpiry(java.time.LocalDateTime resetPasswordCodeExpiry) {
        this.resetPasswordCodeExpiry = resetPasswordCodeExpiry;
    }

    public int getResetPasswordResendCount() {
        return resetPasswordResendCount;
    }

    public void setResetPasswordResendCount(int resetPasswordResendCount) {
        this.resetPasswordResendCount = resetPasswordResendCount;
    }

    public java.time.LocalDateTime getLastResetPasswordResendAt() {
        return lastResetPasswordResendAt;
    }

    public void setLastResetPasswordResendAt(java.time.LocalDateTime lastResetPasswordResendAt) {
        this.lastResetPasswordResendAt = lastResetPasswordResendAt;
    }

    public int getResetPasswordCodeAttempts() {
        return resetPasswordCodeAttempts;
    }

    public void setResetPasswordCodeAttempts(int resetPasswordCodeAttempts) {
        this.resetPasswordCodeAttempts = resetPasswordCodeAttempts;
    }

    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        if (lockoutExpiry == null) {
            return true;
        }
        return java.time.LocalDateTime.now().isAfter(lockoutExpiry);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(enabled);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        User user = (User) o;
        return id != null && id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}