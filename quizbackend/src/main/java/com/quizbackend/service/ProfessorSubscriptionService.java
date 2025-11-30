package com.quizbackend.service;

import com.quizbackend.entity.ProfessorSubscription;
import com.quizbackend.entity.Professor;
import com.quizbackend.repository.ProfessorSubscriptionRepository;
import com.quizbackend.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ProfessorSubscriptionService {

    @Autowired
    private ProfessorSubscriptionRepository professorSubscriptionRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    public ProfessorSubscription createSubscription(
            Integer professorId,
            String planType,
            String priceStr,
            String startDate,
            String endDate,
            String paymentMethod,
            Boolean isActive) {
        
        // Find professor by ID
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with ID: " + professorId));
        
        // Convert price string to BigDecimal
        BigDecimal price = new BigDecimal(priceStr);
        
        // Parse dates from "yyyy-MM-dd" format
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate startDateLD = LocalDate.parse(startDate, dateFormatter);
        LocalDate endDateLD = LocalDate.parse(endDate, dateFormatter);
        
        // Convert to LocalDateTime at start and end of day
        LocalDateTime startDateTime = startDateLD.atStartOfDay();
        LocalDateTime endDateTime = endDateLD.atTime(23, 59, 59);
        
        ProfessorSubscription subscription = new ProfessorSubscription();
        subscription.setProfessorId(professor.getUserId());
        subscription.setPlanType(planType);
        subscription.setPrice(price);
        subscription.setStartDate(startDateTime);
        subscription.setEndDate(endDateTime);
        subscription.setPaymentMethod(paymentMethod);
        subscription.setIsActive(isActive);
        
        // Save the subscription first
        ProfessorSubscription savedSubscription = professorSubscriptionRepository.save(subscription);
        
        // Update professor's subscriptionId to link them
        professor.setSubscriptionId(savedSubscription.getId());
        professorRepository.save(professor);
        
        return savedSubscription;
    }

    public List<ProfessorSubscription> getAllSubscriptions() {
        return professorSubscriptionRepository.findAllOrderByCreatedAtDesc();
    }

    public List<ProfessorSubscription> getSubscriptionsByProfessorId(Integer professorId) {
        return professorSubscriptionRepository.findByProfessorId(professorId);
    }

    public ProfessorSubscription getCurrentSubscription(Integer professorId) {
        List<ProfessorSubscription> subscriptions = professorSubscriptionRepository.findByProfessorId(professorId);
        
        return subscriptions.stream()
                .filter(ProfessorSubscription::getIsActive)
                .filter(subscription -> subscription.getEndDate().isAfter(LocalDateTime.now()))
                .max((s1, s2) -> s1.getEndDate().compareTo(s2.getEndDate()))
                .orElse(null);
    }

    public long getDaysRemaining(ProfessorSubscription subscription) {
        return ChronoUnit.DAYS.between(LocalDateTime.now(), subscription.getEndDate());
    }

    public boolean isExpiringSoon(ProfessorSubscription subscription) {
        return getDaysRemaining(subscription) <= 7;
    }

    public List<Map<String, Object>> getAvailablePlans() {
        List<Map<String, Object>> plans = new ArrayList<>();
        
        // Premium Pro Plan
        Map<String, Object> premiumPlan = new HashMap<>();
        premiumPlan.put("name", "Premium Pro");
        premiumPlan.put("price", new BigDecimal("49900"));
        premiumPlan.put("priceText", "49900 millimes");
        premiumPlan.put("students", "Illimité");
        premiumPlan.put("quizzes", "Illimité");
        premiumPlan.put("color", "from-[#6B4FFF] to-[#8B6FFF]");
        premiumPlan.put("popular", true);
        plans.add(premiumPlan);
        
        // Add more plans as needed
        Map<String, Object> basicPlan = new HashMap<>();
        basicPlan.put("name", "Plan Basique");
        basicPlan.put("price", new BigDecimal("29900"));
        basicPlan.put("priceText", "29900 millimes");
        basicPlan.put("students", "50 étudiants");
        basicPlan.put("quizzes", "25 quizzes");
        basicPlan.put("color", "from-[#4A90E2] to-[#6BA3E8]");
        basicPlan.put("popular", false);
        plans.add(basicPlan);
        
        Map<String, Object> standardPlan = new HashMap<>();
        standardPlan.put("name", "Plan Standard");
        standardPlan.put("price", new BigDecimal("39900"));
        standardPlan.put("priceText", "39900 millimes");
        standardPlan.put("students", "100 étudiants");
        standardPlan.put("quizzes", "50 quizzes");
        standardPlan.put("color", "from-[#7ED321] to-[#9FE541]");
        standardPlan.put("popular", false);
        plans.add(standardPlan);
        
        return plans;
    }

    public ProfessorSubscription getSubscriptionById(Integer id) {
        return professorSubscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
    }

    public void deleteSubscription(Integer id) {
        ProfessorSubscription subscription = getSubscriptionById(id);
        professorSubscriptionRepository.delete(subscription);
    }

    public void updateSubscriptionStatus(Integer id, Boolean isActive) {
        ProfessorSubscription subscription = getSubscriptionById(id);
        subscription.setIsActive(isActive);
        professorSubscriptionRepository.save(subscription);
    }
}