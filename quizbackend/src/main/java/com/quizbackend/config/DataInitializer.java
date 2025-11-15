package com.quizbackend.config;

import com.quizbackend.entity.*;
import com.quizbackend.repository.*;
import com.quizbackend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminService adminService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Override
    public void run(String... args) throws Exception {
        initializeAdmin();
        initializeSubscriptions();
    }

    private void initializeAdmin() {
        try {
            if (!userRepository.existsByUsername("admin")) {
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@quizplatform.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole(User.Role.ADMIN);
                
                User savedUser = userRepository.save(adminUser);
                adminService.createAdmin(savedUser, "System", "Administrator");
            }
        } catch (Exception e) {
            System.out.println("Could not initialize admin user: " + e.getMessage());
        }
    }

    private void initializeSubscriptions() {
        try {
            if (subscriptionRepository.count() == 0) {
                // Free subscription
                subscriptionService.createSubscription("Free", BigDecimal.ZERO, 30);
                
                // Premium subscription
                subscriptionService.createSubscription("Premium", new BigDecimal("9.99"), 30);
                
                // VIP subscription
                subscriptionService.createSubscription("VIP", new BigDecimal("19.99"), 30);
            }
        } catch (Exception e) {
            System.out.println("Could not initialize subscriptions: " + e.getMessage());
        }
    }
}
