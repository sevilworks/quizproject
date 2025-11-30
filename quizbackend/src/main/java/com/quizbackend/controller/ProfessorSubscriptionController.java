package com.quizbackend.controller;

import com.quizbackend.entity.ProfessorSubscription;
import com.quizbackend.service.ProfessorSubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professor/subscription")
@CrossOrigin(origins = "*")
public class ProfessorSubscriptionController {

    @Autowired
    private ProfessorSubscriptionService professorSubscriptionService;

    @GetMapping("/{professorId}")
    public ResponseEntity<?> getProfessorSubscription(@PathVariable Integer professorId) {
        try {
            List<ProfessorSubscription> subscriptions = professorSubscriptionService.getSubscriptionsByProfessorId(professorId);
            
            if (subscriptions.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("hasActiveSubscription", false);
                response.put("subscription", null);
                return ResponseEntity.ok(response);
            }
            
            // Get the most recent active subscription
            ProfessorSubscription currentSubscription = professorSubscriptionService.getCurrentSubscription(professorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasActiveSubscription", currentSubscription != null);
            response.put("subscription", currentSubscription);
            
            if (currentSubscription != null) {
                response.put("daysRemaining", professorSubscriptionService.getDaysRemaining(currentSubscription));
                response.put("isExpiringSoon", professorSubscriptionService.isExpiringSoon(currentSubscription));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
}