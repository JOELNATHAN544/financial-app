package com.example.financialtracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_devices")
public class UserDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_hash", nullable = false)
    private String deviceHash;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    private boolean trusted;

    public UserDevice() {
    }

    public UserDevice(User user, String deviceHash, String deviceName, LocalDateTime lastLogin) {
        this.user = user;
        this.deviceHash = deviceHash;
        this.deviceName = deviceName;
        this.lastLogin = lastLogin;
        this.trusted = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDeviceHash() {
        return deviceHash;
    }

    public void setDeviceHash(String deviceHash) {
        this.deviceHash = deviceHash;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isTrusted() {
        return trusted;
    }

    public void setTrusted(boolean trusted) {
        this.trusted = trusted;
    }
}
