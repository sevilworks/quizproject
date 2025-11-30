package com.quizbackend.service;

import com.quizbackend.entity.User;
import com.quizbackend.repository.UserRepository;
import com.quizbackend.repository.StudentRepository;
import com.quizbackend.repository.ProfessorRepository;
import com.quizbackend.entity.ProfessorSubscription;
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
    private ProfessorRepository professorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ProfessorSubscriptionService professorSubscriptionService;

    @Autowired
    private EmailService emailService;


    public Map<String, Object> login(String username, String password) {
        logger.info("Login attempt for username: {}", username);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            logger.warn("Invalid login attempt for username={}", username);
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOpt.get();

        // Check if account is enabled
        if (!user.getEnabled()) {
            logger.warn("Login attempt with disabled account: {}", username);
            throw new RuntimeException("Your account is disabled. Please contact the administrator.");
        }

        // Removed email verification check - users can login even without email verification
        logger.info("Login successful for user with emailVerified={}, enabled={}",
                   user.getEmailVerified(), user.getEnabled());

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Get user-specific details
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

        // Add professor-specific fields if this is a professor
        if (user.getRole() == User.Role.PROFESSOR_FREE || user.getRole() == User.Role.PROFESSOR_VIP) {
            logger.debug("User is PROFESSOR, fetching professor profile for userId={}", user.getId());
            // Get professor details from database
            Optional<com.quizbackend.entity.Professor> professorOpt = professorRepository.findById(user.getId());
            if (professorOpt.isPresent()) {
                com.quizbackend.entity.Professor professor = professorOpt.get();
                userData.put("firstName", professor.getFirstName());
                userData.put("lastName", professor.getLastName());
                userData.put("professorId", professor.getUserId());
                logger.debug("Professor profile found: id={}, firstName={}, lastName={}",
                    professor.getUserId(), professor.getFirstName(), professor.getLastName());
                
                // Get subscription information
                try {
                    ProfessorSubscription currentSubscription = professorSubscriptionService.getCurrentSubscription(professor.getUserId());
                    if (currentSubscription != null) {
                        Map<String, Object> subscriptionInfo = new HashMap<>();
                        subscriptionInfo.put("id", currentSubscription.getId());
                        subscriptionInfo.put("planType", currentSubscription.getPlanType());
                        subscriptionInfo.put("price", currentSubscription.getPrice());
                        subscriptionInfo.put("startDate", currentSubscription.getStartDate());
                        subscriptionInfo.put("endDate", currentSubscription.getEndDate());
                        subscriptionInfo.put("isActive", currentSubscription.getIsActive());
                        subscriptionInfo.put("daysRemaining", professorSubscriptionService.getDaysRemaining(currentSubscription));
                        subscriptionInfo.put("isExpiringSoon", professorSubscriptionService.isExpiringSoon(currentSubscription));
                        
                        userData.put("currentSubscription", subscriptionInfo);
                        logger.debug("Subscription found for professor: {}", subscriptionInfo);
                    } else {
                        userData.put("currentSubscription", null);
                        logger.debug("No active subscription found for professor");
                    }
                } catch (Exception e) {
                    // If subscription lookup fails, continue without subscription info
                    userData.put("currentSubscription", null);
                    logger.warn("Could not load subscription info: {}", e.getMessage());
                }
            } else {
                // Fallback if professor profile doesn't exist - this indicates the bug
                logger.error("PROFESSOR ROLE USER HAS NO PROFESSOR ENTITY: userId={}, username={}. This indicates signup process failure.",
                    user.getId(), user.getUsername());
                userData.put("firstName", null);
                userData.put("lastName", null);
                userData.put("currentSubscription", null);
                logger.warn("Professor profile not found for user: {}", user.getUsername());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userData);
        response.put("role", user.getRole().name());

        logger.info("User logged in successfully: username={}, role={}", user.getUsername(), user.getRole());

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

    /**
     * Register student with email verification
     */
    public Map<String, Object> registerStudent(String username, String email, String password, String firstName, String lastName) {
        logger.info("Registering student with email verification: username={}, email={}, firstName={}, lastName={}",
                   username, email, firstName, lastName);

        if (userRepository.existsByUsername(username)) {
            logger.warn("Username already exists: {}", username);
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            logger.warn("Email already exists: {}", email);
            throw new RuntimeException("Email already exists");
        }

        try {
            // Create user with email verification fields
            String verificationToken = UUID.randomUUID().toString();
            LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24); // 24 hours expiry

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(User.Role.STUDENT);
            user.setEmailVerified(false);
            user.setEnabled(true); // Account enabled by default
            user.setEmailVerificationToken(verificationToken);
            user.setEmailVerificationTokenExpiry(tokenExpiry);

            User savedUser = userRepository.save(user);

            logger.info("Student user saved to DB: id={}, username={}, emailVerified={}",
                       savedUser.getId(), savedUser.getUsername(), savedUser.getEmailVerified());

            // Send verification email - if this fails, we delete the user
            try {
                emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getUsername(), verificationToken);
                logger.info("Verification email sent successfully for student: {}", savedUser.getUsername());
            } catch (Exception e) {
                logger.error("Failed to send verification email for student: {}. Deleting user. Error: {}",
                            savedUser.getUsername(), e.getMessage());
                // Delete the user if email fails to ensure data consistency
                userRepository.delete(savedUser);
                throw new RuntimeException("Error sending verification email. Please try again.");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student registered successfully. Please check your email to verify your account.");
            response.put("userId", savedUser.getId());
            response.put("emailVerificationRequired", true);
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());

            return response;
        } catch (Exception e) {
            logger.error("Error during student registration for {}: {}", email, e.getMessage());
            throw new RuntimeException("Error during registration: " + e.getMessage());
        }
    }

    /**
     * Register professor with email verification
     */
    public Map<String, Object> registerProfessor(String username, String email, String password, String firstName, String lastName) {
        logger.info("Registering professor with email verification: username={}, email={}, firstName={}, lastName={}",
                   username, email, firstName, lastName);

        if (userRepository.existsByUsername(username)) {
            logger.warn("Username already exists: {}", username);
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            logger.warn("Email already exists: {}", email);
            throw new RuntimeException("Email already exists");
        }

        try {
            // Create user with email verification fields
            String verificationToken = UUID.randomUUID().toString();
            LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24); // 24 hours expiry

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(User.Role.PROFESSOR_FREE);
            user.setEmailVerified(false);
            user.setEnabled(true); // Account enabled by default
            user.setEmailVerificationToken(verificationToken);
            user.setEmailVerificationTokenExpiry(tokenExpiry);

            User savedUser = userRepository.save(user);

            logger.info("Professor user saved to DB: id={}, username={}, emailVerified={}",
                       savedUser.getId(), savedUser.getUsername(), savedUser.getEmailVerified());

            // Send verification email - if this fails, we delete the user
            try {
                emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getUsername(), verificationToken);
                logger.info("Verification email sent successfully for professor: {}", savedUser.getUsername());
            } catch (Exception e) {
                logger.error("Failed to send verification email for professor: {}. Deleting user. Error: {}",
                            savedUser.getUsername(), e.getMessage());
                // Delete the user if email fails to ensure data consistency
                userRepository.delete(savedUser);
                throw new RuntimeException("Error sending verification email. Please try again.");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Professor registered successfully. Please check your email to verify your account.");
            response.put("userId", savedUser.getId());
            response.put("emailVerificationRequired", true);
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());

            return response;
        } catch (Exception e) {
            logger.error("Error during professor registration for {}: {}", email, e.getMessage());
            throw new RuntimeException("Error during registration: " + e.getMessage());
        }
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

    /**
     * Resend verification email
     */
    public Map<String, Object> resendVerificationEmail(String email) {
        logger.info("Resend verification email request for: {}", email);

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email address is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Attempt to resend email for non-existent user: {}", email);
                    return new RuntimeException("No account is associated with this email address");
                });

        // Check if email is already verified
        if (user.getEmailVerified()) {
            logger.info("Attempt to resend email for already verified email: {}", email);
            throw new RuntimeException("This email is already verified. You can log in.");
        }

        // Generate new token
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Resend email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken);
            logger.info("Verification email resent successfully to: {}", email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Verification email sent successfully. Please check your inbox.");
            return response;
        } catch (Exception e) {
            logger.error("Error resending verification email to {}: {}", email, e.getMessage());
            throw new RuntimeException("Error sending verification email. Please try again later.");
        }
    }

    public Map<String, Object> verifyEmail(String token) {
        logger.info("Attempting email verification with token: {}...",
                   token != null ? token.substring(0, Math.min(8, token.length())) : "null");

        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Verification token is required");
        }

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> {
                    logger.warn("Invalid verification token: {}", token);
                    return new RuntimeException("Invalid verification token");
                });

        // Check if token has expired
        if (user.getEmailVerificationTokenExpiry() != null &&
                user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("Verification token expired for user: {}", user.getEmail());
            throw new RuntimeException("Verification token has expired. Please request a new verification link.");
        }

        // Check if email is already verified
        if (user.getEmailVerified()) {
            logger.info("Email already verified for: {}", user.getEmail());
            throw new RuntimeException("This email is already verified. You can log in.");
        }

        // Mark email as verified and enable account
        user.setEmailVerified(true);
        user.setEnabled(true); // Enable account after email verification
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        logger.info("Email verified successfully for user: {}", user.getUsername());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email verified successfully! You can now log in to your account.");
        return response;
    }
}
