package com.quizbackend.controller;

import com.quizbackend.entity.User;
import com.quizbackend.entity.Student;
import com.quizbackend.entity.Professor;
import com.quizbackend.service.AuthService;
import com.quizbackend.service.ProfessorService;
import com.quizbackend.service.StudentService;
import com.quizbackend.service.AdminService;
import com.quizbackend.security.JwtUtil;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private ProfessorService professorService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            logger.info("Login attempt for username={}", request.getUsername());
            Map<String, Object> response = authService.login(request.getUsername(), request.getPassword());
            logger.info("Login successful for username={}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.warn("Login failed for username={}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/student")
    @Transactional
    public ResponseEntity<?> registerStudent(@RequestBody StudentRegisterRequest request) {
        try {
            logger.info("RegisterStudent request received: username={}, email={}, firstName={}, lastName={}",
                    request.getUsername(), request.getEmail(), request.getFirstName(), request.getLastName());

            User user = authService.register(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                User.Role.STUDENT,
                request.getFirstName(),
                request.getLastName()
            );
            logger.info("User entity created: id={}, username={}, role={}", user.getId(), user.getUsername(), user.getRole());

            Student student = studentService.createStudent(user, request.getFirstName(), request.getLastName());
            logger.info("Student entity saved: id={}, user={}, firstName={}, lastName={}",
                student.getId(),
                student.getUser() != null ? "id=" + student.getUser().getId() + ",username=" + student.getUser().getUsername() : "NULL",
                student.getFirstName(), student.getLastName());

            return ResponseEntity.ok(Map.of("message", "Student registered successfully", "userId", user.getId()));
        } catch (Exception e) {
            logger.error("Error registering student: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/professor")
    public ResponseEntity<?> registerProfessor(@RequestBody ProfessorRegisterRequest request) {
        try {
            logger.info("RegisterProfessor request received: username={}, email={}, firstName={}, lastName={}",
                    request.getUsername(), request.getEmail(), request.getFirstName(), request.getLastName());

            User user = authService.register(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                User.Role.PROFESSOR_FREE,
                request.getFirstName(),
                request.getLastName()
            );
            logger.info("User entity created: id={}, username={}, role={}", user.getId(), user.getUsername(), user.getRole());

            Professor professor = professorService.createProfessor(user, request.getFirstName(), request.getLastName());
            logger.info("Professor entity saved: {}", professor);

            return ResponseEntity.ok(Map.of("message", "Professor registered successfully", "userId", user.getId()));
        } catch (Exception e) {
            logger.error("Error registering professor: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            User user = authService.getCurrentUser(username);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            Map<String, Object> response = authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            Map<String, Object> response = authService.validateResetToken(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            Map<String, Object> response = authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Map<String, Object> response = authService.resendVerificationEmail(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            Map<String, Object> response = authService.verifyEmail(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractUsernameFromToken(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUsernameFromToken(token);
    }

    // Request DTOs
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class StudentRegisterRequest {
        private String username;
        private String email;
        private String password;

        @JsonProperty("first_name")
        private String firstName;

        @JsonProperty("last_name")
        private String lastName;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }

    public static class ProfessorRegisterRequest {
        private String username;
        private String email;
        private String password;
        
        @JsonProperty("first_name")
        private String firstName;
        
        @JsonProperty("last_name")
        private String lastName;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }

    public static class ForgotPasswordRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
