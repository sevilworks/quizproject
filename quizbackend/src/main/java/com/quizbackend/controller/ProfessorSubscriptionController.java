package com.quizbackend.controller;

import com.quizbackend.entity.Professor;
import com.quizbackend.entity.ProfessorSubscription;
import com.quizbackend.dto.ProfessorSubscriptionResponse;
import com.quizbackend.service.ProfessorSubscriptionService;
import com.quizbackend.service.ProfessorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professors/subscriptions")
@CrossOrigin(origins = "*")
public class ProfessorSubscriptionController {

    private static final Logger logger = LoggerFactory.getLogger(ProfessorSubscriptionController.class);

    @Autowired
    private ProfessorSubscriptionService professorSubscriptionService;

    @Autowired
    private ProfessorService professorService;

    @GetMapping("/{professorId}")
    public ResponseEntity<?> getProfessorSubscription(@PathVariable Integer professorId) {
        try {
            // Get professor information to include role
            Professor professor = professorService.getProfessorById(professorId);
            
            List<ProfessorSubscription> subscriptions = professorSubscriptionService.getSubscriptionsByProfessorId(professorId);
            
            if (subscriptions.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("hasActiveSubscription", false);
                response.put("subscription", null);
                response.put("role", professor.getRole());
                response.put("daysRemaining", null);
                response.put("isExpiringSoon", null);
                return ResponseEntity.ok(response);
            }
            
            // Get the most recent active subscription
            ProfessorSubscription currentSubscription = professorSubscriptionService.getCurrentSubscription(professorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasActiveSubscription", currentSubscription != null);
            response.put("subscription", currentSubscription);
            response.put("role", professor.getRole());
            
            if (currentSubscription != null) {
                response.put("daysRemaining", professorSubscriptionService.getDaysRemaining(currentSubscription));
                response.put("isExpiringSoon", professorSubscriptionService.isExpiringSoon(currentSubscription));
            } else {
                response.put("daysRemaining", null);
                response.put("isExpiringSoon", null);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching professor subscription for ID {}: {}", professorId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{professorId}/plans")
    public ResponseEntity<?> getAvailablePlans() {
        try {
            List<Map<String, Object>> plans = professorSubscriptionService.getAvailablePlans();
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSubscription(@RequestBody Map<String, Object> request) {
        try {
            Integer professorId = (Integer) request.get("professorId");
            String planType = (String) request.get("planType");
            String price = (String) request.get("price");
            String startDate = (String) request.get("startDate");
            String endDate = (String) request.get("endDate");
            String paymentMethod = (String) request.get("paymentMethod");
            Boolean isActive = (Boolean) request.get("isActive");

            ProfessorSubscription subscription = professorSubscriptionService.createSubscription(
                professorId, planType, price, startDate, endDate, paymentMethod, isActive
            );
            
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{subscriptionId}/status")
    public ResponseEntity<?> updateSubscriptionStatus(@PathVariable Integer subscriptionId, @RequestBody Map<String, Object> request) {
        try {
            Boolean isActive = (Boolean) request.get("isActive");
            professorSubscriptionService.updateSubscriptionStatus(subscriptionId, isActive);
            return ResponseEntity.ok(Map.of("message", "Subscription status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{subscriptionId}")
    public ResponseEntity<?> deleteSubscription(@PathVariable Integer subscriptionId) {
        try {
            professorSubscriptionService.deleteSubscription(subscriptionId);
            return ResponseEntity.ok(Map.of("message", "Subscription deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Direct plan update endpoint (for development purposes)
     * Updates professor's plan directly without payment processing
     */
    @PutMapping("/update-plan")
    public ResponseEntity<?> updateProfessorPlan(@RequestBody Map<String, Object> request) {
        logger.info("Received plan update request: {}", request);
        
        try {
            String professorId = String.valueOf(request.get("professorId"));
            String newPlan = (String) request.get("plan");
            
            if (professorId == null || newPlan == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Professor ID and plan are required"
                ));
            }
            
            logger.info("Updating professor plan - ID: {}, Plan: {}", professorId, newPlan);
            Map<String, Object> result = professorSubscriptionService.updateProfessorPlan(professorId, newPlan);
            
            logger.info("Plan update successful: {}", result);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error updating professor plan: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}