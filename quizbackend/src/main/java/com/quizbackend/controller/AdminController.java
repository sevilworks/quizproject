package com.quizbackend.controller;

import com.quizbackend.entity.*;
import com.quizbackend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ProfessorService professorService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private GuestService guestService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private QuizService quizService;

    // User Management
    @GetMapping("/users/professors")
    public ResponseEntity<?> getAllProfessors() {
        try {
            List<Professor> professors = professorService.getAllProfessors();
            return ResponseEntity.ok(professors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/students")
    public ResponseEntity<?> getAllStudents() {
        try {
            List<Student> students = studentService.getAllStudents();
            List<com.quizbackend.dto.StudentDto> dtos = students.stream()
                .map(com.quizbackend.dto.StudentDto::fromEntity)
                .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/guests")
    public ResponseEntity<?> getAllGuests() {
        try {
            List<Guest> guests = guestService.getAllGuests();
            return ResponseEntity.ok(guests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/admins")
    public ResponseEntity<?> getAllAdmins() {
        try {
            List<Admin> admins = adminService.getAllAdmins();
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Subscription Management
    @PostMapping("/subscriptions")
    public ResponseEntity<?> createSubscription(@RequestBody SubscriptionRequest request) {
        try {
            Subscription subscription = subscriptionService.createSubscription(
                request.getName(),
                request.getPrice(),
                request.getDurationDays()
            );
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<?> getAllSubscriptions() {
        try {
            List<Subscription> subscriptions = subscriptionService.getAllSubscriptions();
            return ResponseEntity.ok(subscriptions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<?> updateSubscription(@PathVariable Integer subscriptionId, @RequestBody SubscriptionRequest request) {
        try {
            Subscription subscription = subscriptionService.updateSubscription(
                subscriptionId,
                request.getName(),
                request.getPrice(),
                request.getDurationDays()
            );
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<?> deleteSubscription(@PathVariable Integer subscriptionId) {
        try {
            subscriptionService.deleteSubscription(subscriptionId);
            return ResponseEntity.ok(Map.of("message", "Subscription deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/professors/{professorId}/assign-subscription")
    public ResponseEntity<?> assignSubscriptionToProfessor(@PathVariable Integer professorId, @RequestBody AssignSubscriptionRequest request) {
        try {
            professorService.assignSubscription(professorId, request.getSubscriptionId());
            return ResponseEntity.ok(Map.of("message", "Subscription assigned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Quiz Management
    @GetMapping("/quizzes")
    public ResponseEntity<?> getAllQuizzes() {
        try {
            List<Quiz> quizzes = quizService.getAllQuizzes();
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Integer quizId) {
        try {
            quizService.deleteQuiz(quizId, null); // Admin can delete any quiz
            return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTOs
    public static class SubscriptionRequest {
    private String name;
    private java.math.BigDecimal price;
    @com.fasterxml.jackson.annotation.JsonProperty("duration_days")
    private Integer durationDays;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public java.math.BigDecimal getPrice() { return price; }
    public void setPrice(java.math.BigDecimal price) { this.price = price; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    }

    public static class AssignSubscriptionRequest {
        private Integer subscriptionId;

        public Integer getSubscriptionId() { return subscriptionId; }
        public void setSubscriptionId(Integer subscriptionId) { this.subscriptionId = subscriptionId; }
    }
}
