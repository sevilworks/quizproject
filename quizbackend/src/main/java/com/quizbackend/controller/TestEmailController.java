package com.quizbackend.controller;

import com.quizbackend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Test controller for email service debugging
 */
@RestController
@RequestMapping("/test/email")
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/test")
    public ResponseEntity<String> testEmail(@RequestParam String email, @RequestParam String username, @RequestParam String token) {
        try {
            emailService.sendVerificationEmail(email, username, token);
            return ResponseEntity.ok("Email sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email failed: " + e.getMessage());
        }
    }

    @GetMapping("/config")
    public ResponseEntity<String> checkConfig() {
        return ResponseEntity.ok("Email service configuration check complete - service is properly injected");
    }
}