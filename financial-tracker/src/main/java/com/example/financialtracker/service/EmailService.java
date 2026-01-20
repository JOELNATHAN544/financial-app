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

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = html

            mailSender.send(message);
        } catch (jakarta.mail.MessagingException e) {
            log.warn("Error sending email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendSimpleMessage(String to, String subject, String text) {
        sendEmail(to, subject, text);
    }

    @Async
    public void sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to FinanceFlow!";
        String body = "<h1>Welcome, " + username + "!</h1>" +
                "<p>Thank you for registering with FinanceFlow. We are excited to help you manage your finances.</p>";
        sendEmail(to, subject, body);
    }

    @Async
    public void sendNewDeviceLoginAlert(String to, String username, String deviceDetails, String time) {
        String subject = "New Login Detected";
        String body = "<h1>New Login Alert</h1>" +
                "<p>Hi " + username + ",</p>" +
                "<p>We detected a new login to your account.</p>" +
                "<ul>" +
                "<li>Device: " + deviceDetails + "</li>" +
                "<li>Time: " + time + "</li>" +
                "</ul>" +
                "<p>If this wasn't you, please reset your password immediately.</p>";
        sendEmail(to, subject, body);
    }

    @Async
    public void sendDeletionCode(String to, String code) {
        String subject = "Account Deletion Verification Code";
        String body = "<h1>Account Deletion Request</h1>" +
                "<p>You have requested to delete your account. This action cannot be undone.</p>" +
                "<p>Your verification code is: <strong>" + code + "</strong></p>" +
                "<p>If you did not request this, please ignore this email.</p>";
        sendEmail(to, subject, body);
    }
}
