package com.quizbackend.controller;

import com.quizbackend.entity.*;
import com.quizbackend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    private ProfessorSubscriptionService professorSubscriptionService;

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

    // Get FREE professors (those without active subscriptions)
    @GetMapping("/users/professors/free")
    public ResponseEntity<?> getFreeProfessors() {
        try {
            List<Professor> professors = professorService.getAllProfessors();
            // Filter out professors who have active subscriptions
            List<Professor> freeProfessors = professors.stream()
                .filter(professor -> professor.getSubscriptionId() == null)
                .toList();
            return ResponseEntity.ok(freeProfessors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Subscription Management
    @PostMapping("/subscriptions")
    public ResponseEntity<?> createSubscription(@RequestBody Map<String, Object> request) {
        try {
            Integer professorId = (Integer) request.get("professorId");
            String planType = (String) request.get("planType");
            String price = request.get("price").toString(); // Changed from BigDecimal to String
            String startDate = (String) request.get("startDate");
            String endDate = (String) request.get("endDate");
            String paymentMethod = (String) request.get("paymentMethod");
            Boolean isActive = (Boolean) request.get("isActive");
            
            com.quizbackend.entity.ProfessorSubscription subscription = professorSubscriptionService.createSubscription(
                professorId,
                planType,
                price,
                startDate,
                endDate,
                paymentMethod,
                isActive
            );
            
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<?> getAllSubscriptions() {
        try {
            List<com.quizbackend.entity.ProfessorSubscription> subscriptions = professorSubscriptionService.getAllSubscriptions();
            
            // Create simplified DTOs to avoid lazy loading issues
            List<Map<String, Object>> subscriptionDTOs = subscriptions.stream().map(sub -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", sub.getId());
                dto.put("professorId", sub.getProfessorId());
                dto.put("planType", sub.getPlanType());
                dto.put("price", sub.getPrice());
                dto.put("startDate", sub.getStartDate());
                dto.put("endDate", sub.getEndDate());
                dto.put("paymentMethod", sub.getPaymentMethod());
                dto.put("isActive", sub.getIsActive());
                dto.put("createdAt", sub.getCreatedAt());
                
                // Add simplified professor info
                if (sub.getProfessorId() != null) {
                    com.quizbackend.entity.Professor prof = professorService.getAllProfessors().stream()
                        .filter(p -> p.getUserId().equals(sub.getProfessorId()))
                        .findFirst()
                        .orElse(null);
                    
                    if (prof != null) {
                        Map<String, Object> profInfo = new HashMap<>();
                        profInfo.put("userId", prof.getUserId());
                        profInfo.put("firstName", prof.getFirstName());
                        profInfo.put("lastName", prof.getLastName());
                        dto.put("professor", profInfo);
                    }
                }
                
                return dto;
            }).toList();
            
            return ResponseEntity.ok(subscriptionDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<?> updateSubscription(@PathVariable Integer subscriptionId, @RequestBody Map<String, Object> request) {
        try {
            Boolean isActive = (Boolean) request.get("isActive");
            professorSubscriptionService.updateSubscriptionStatus(subscriptionId, isActive);
            return ResponseEntity.ok(Map.of("message", "Subscription updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<?> deleteSubscription(@PathVariable Integer subscriptionId) {
        try {
            professorSubscriptionService.deleteSubscription(subscriptionId);
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

    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Reclamation Management
    @GetMapping("/reclamations")
    public ResponseEntity<?> getAllReclamations() {
        try {
            List<com.quizbackend.entity.Reclamation> reclamations = adminService.getAllReclamations();
            return ResponseEntity.ok(reclamations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/reclamations/{reclamationId}/status")
    public ResponseEntity<?> updateReclamationStatus(@PathVariable Integer reclamationId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            adminService.updateReclamationStatus(reclamationId, status);
            return ResponseEntity.ok(Map.of("message", "Reclamation status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reclamations/{reclamationId}/responses")
    public ResponseEntity<?> sendReclamationResponse(@PathVariable Integer reclamationId, @RequestBody Map<String, String> request) {
        try {
            String response = request.get("response");
            adminService.sendReclamationResponse(reclamationId, response);
            return ResponseEntity.ok(Map.of("message", "Response sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/reclamations/{reclamationId}")
    public ResponseEntity<?> deleteReclamation(@PathVariable Integer reclamationId) {
        try {
            adminService.deleteReclamation(reclamationId);
            return ResponseEntity.ok(Map.of("message", "Reclamation deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all subscription plans
    @GetMapping("/subscriptions/plans")
    public ResponseEntity<?> getAllSubscriptionPlans() {
        try {
            List<com.quizbackend.entity.Subscription> plans = adminService.getAllSubscriptionPlans();
            return ResponseEntity.ok(plans);
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
