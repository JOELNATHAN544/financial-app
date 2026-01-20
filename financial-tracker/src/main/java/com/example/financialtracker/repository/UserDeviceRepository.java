package com.example.financialtracker.repository;

import com.example.financialtracker.model.User;
import com.example.financialtracker.model.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    Optional<UserDevice> findByUserAndDeviceHash(User user, String deviceHash);

    java.util.List<UserDevice> findAllByUser(User user);
}
