package com.example.financialtracker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class SystemStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "last_finalization", nullable = false)
    private LocalDateTime lastFinalization;

    @Column(name = "is_auto_finalization_enabled", nullable = false)
    private boolean autoFinalizationEnabled = true;
} 