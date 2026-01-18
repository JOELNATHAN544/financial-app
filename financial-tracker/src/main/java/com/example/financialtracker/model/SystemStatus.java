package com.example.financialtracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SystemStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "last_finalization", nullable = false)
    private LocalDateTime lastFinalization;

    @Column(name = "is_auto_finalization_enabled", nullable = false)
    private boolean autoFinalizationEnabled = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getLastFinalization() {
        return lastFinalization;
    }

    public void setLastFinalization(LocalDateTime lastFinalization) {
        this.lastFinalization = lastFinalization;
    }

    public boolean isAutoFinalizationEnabled() {
        return autoFinalizationEnabled;
    }

    public void setAutoFinalizationEnabled(boolean autoFinalizationEnabled) {
        this.autoFinalizationEnabled = autoFinalizationEnabled;
    }
}