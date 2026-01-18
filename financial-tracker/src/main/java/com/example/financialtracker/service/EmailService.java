package com.example.financialtracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Error sending email to {}: {}", to, e.getMessage(), e);
            // We don't want to block the main flow if email fails
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to FinanceFlow!";
        String text = "Hello " + username + ",\n\n" +
                "Thank you for joining FinanceFlow! We're excited to help you track your finances effectively.\n\n" +
                "Best regards,\nThe FinanceFlow Team";
        sendSimpleMessage(to, subject, text);
    }

    @Async
    public void sendLoginAlert(String to, String username) {
        String subject = "FinanceFlow: New Login Detected";
        String text = "Hello " + username + ",\n\n" +
                "This is a quick security alert to let you know that a new login was detected on your account.\n" +
                "If this was you, you can safely ignore this email.\n\n" +
                "Best regards,\nThe FinanceFlow Team";
        sendSimpleMessage(to, subject, text);
    }
}
