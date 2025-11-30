package com.quizbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorSubscriptionApiResponse {
    
    private Boolean hasActiveSubscription;
    private ProfessorSubscriptionResponse subscription;
    private Long daysRemaining;
    private Boolean isExpiringSoon;
    
    public static ProfessorSubscriptionApiResponse withSubscription(
            ProfessorSubscriptionResponse subscription, 
            Long daysRemaining, 
            Boolean isExpiringSoon) {
        
        ProfessorSubscriptionApiResponse response = new ProfessorSubscriptionApiResponse();
        response.setHasActiveSubscription(subscription != null);
        response.setSubscription(subscription);
        response.setDaysRemaining(daysRemaining);
        response.setIsExpiringSoon(isExpiringSoon);
        
        return response;
    }
    
    public static ProfessorSubscriptionApiResponse withoutSubscription() {
        ProfessorSubscriptionApiResponse response = new ProfessorSubscriptionApiResponse();
        response.setHasActiveSubscription(false);
        response.setSubscription(null);
        response.setDaysRemaining(null);
        response.setIsExpiringSoon(null);
        
        return response;
    }
}