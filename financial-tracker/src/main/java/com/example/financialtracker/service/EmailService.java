package com.example.financialtracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
            // We don't want to block the main flow if email fails
        }
    }

    public void sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to FinanceFlow!";
        String text = "Hello " + username + ",\n\n" +
                "Thank you for joining FinanceFlow! We're excited to help you track your finances effectively.\n\n" +
                "Best regards,\nThe FinanceFlow Team";
        sendSimpleMessage(to, subject, text);
    }

    public void sendLoginAlert(String to, String username) {
        String subject = "FinanceFlow: New Login Detected";
        String text = "Hello " + username + ",\n\n" +
                "This is a quick security alert to let you know that a new login was detected on your account.\n" +
                "If this was you, you can safely ignore this email.\n\n" +
                "Best regards,\nThe FinanceFlow Team";
        sendSimpleMessage(to, subject, text);
    }
}
