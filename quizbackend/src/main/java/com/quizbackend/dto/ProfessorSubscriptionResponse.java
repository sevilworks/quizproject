package com.quizbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorSubscriptionResponse {
    
    private Integer id;
    private Integer professorId;
    private String planType;
    private BigDecimal price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String paymentMethod;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    // Professor role information
    private String role; // PROFESSOR_FREE, PROFESSOR_VIP
    
    // Computed fields
    private Long daysRemaining;
    private Boolean isExpiringSoon;
    private Boolean hasActiveSubscription;
}