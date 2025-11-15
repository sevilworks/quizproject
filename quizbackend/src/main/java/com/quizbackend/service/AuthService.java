package com.quizbackend.service;

import com.quizbackend.entity.User;
import com.quizbackend.repository.UserRepository;
import com.quizbackend.repository.StudentRepository;
import com.quizbackend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            logger.warn("Invalid login attempt for username={}", username);
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Get student details if user is a student
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole().name());

        // Add student-specific fields if this is a student
        if (user.getRole() == User.Role.STUDENT) {
            logger.debug("User is STUDENT, fetching student profile for userId={}", user.getId());
            // Get student details from database
            Optional<com.quizbackend.entity.Student> studentOpt = studentRepository.findByUser(user);
            if (studentOpt.isPresent()) {
                com.quizbackend.entity.Student student = studentOpt.get();
                userData.put("firstName", student.getFirstName());
                userData.put("lastName", student.getLastName());
                logger.debug("Student profile found: id={}, firstName={}, lastName={}",
                    student.getId(), student.getFirstName(), student.getLastName());
            } else {
                // Fallback if student profile doesn't exist - this indicates the bug
                logger.error("STUDENT ROLE USER HAS NO STUDENT ENTITY: userId={}, username={}. This indicates signup process failure.",
                    user.getId(), user.getUsername());
                userData.put("firstName", null);
                userData.put("lastName", null);
                logger.warn("Student profile not found for user: {}", user.getUsername());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userData);
        response.put("role", user.getRole().name());

        logger.info("User logged in: username={}, role={}", user.getUsername(), user.getRole());

        return response;
    }

    public User register(String username, String email, String password, User.Role role, String firstName, String lastName) {
        logger.info("Registering user: username={}, email={}, role={}, firstName={}, lastName={}", username, email, role, firstName, lastName);

        if (userRepository.existsByUsername(username)) {
            logger.warn("Username already exists: {}", username);
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            logger.warn("Email already exists: {}", email);
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        logger.info("User saved to DB: id={}, username={}", savedUser.getId(), savedUser.getUsername());

        // Create specific user type based on role
        switch (role) {
            case PROFESSOR_FREE, PROFESSOR_VIP -> {
                // Professor creation will be handled in ProfessorService
            }
            case STUDENT -> {
                // Student creation will be handled in StudentService
            }
            case ADMIN -> {
                // Admin creation will be handled in AdminService
            }
        }

        return savedUser;
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Map<String, Object> forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(1); // Token valid for 1 hour

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiry);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset token generated successfully");
        response.put("resetToken", resetToken); // In real implementation, this would be sent via email

        logger.info("Password reset token generated for user: {}", user.getUsername());
        return response;
    }

    public Map<String, Object> validateResetToken(String token) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid reset token");
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("message", "Reset token is valid");

        return response;
    }

    public Map<String, Object> resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid reset token");
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset successfully");

        logger.info("Password reset successfully for user: {}", user.getUsername());
        return response;
    }

    public Map<String, Object> resendVerificationEmail(String username) {
        User user = getCurrentUser(username);
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        String verificationToken = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(24); // Token valid for 24 hours

        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(expiry);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Verification email sent successfully");
        response.put("verificationToken", verificationToken); // In real implementation, this would be sent via email

        logger.info("Verification token generated for user: {}", user.getUsername());
        return response;
    }

    public Map<String, Object> verifyEmail(String token) {
        Optional<User> userOpt = userRepository.findByEmailVerificationToken(token);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid verification token");
        }

        User user = userOpt.get();
        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email verified successfully");

        logger.info("Email verified successfully for user: {}", user.getUsername());
        return response;
    }
}
