package com.quizbackend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ParticipationDto {
    private Integer id;
    private BigDecimal score;
    private Boolean isFraud;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private QuizSummary quiz;
    private Integer userId;
    private Integer guestId;
    private String userName;
    private String userEmail;
    private String guestName;
    private Integer questionCount;
    private Integer correctAnswers;
    private Integer duration;
    private String studentResponses;

    @Data
    public static class QuizSummary {
        private Integer id;
        private String title;
        private String code;
        private String description;
    }

    public static ParticipationDto fromEntity(com.quizbackend.entity.Participation p) {
        if (p == null) return null;
        ParticipationDto dto = new ParticipationDto();
        dto.setId(p.getId());
        dto.setScore(p.getScore());
        dto.setIsFraud(p.getIsFraud());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUserId(p.getUserId());
        dto.setGuestId(p.getGuestId());
        dto.setStudentResponses(p.getStudentResponses());

        // Add user details if available
        if (p.getUser() != null) {
            dto.setUserName(p.getUser().getUsername());
            dto.setUserEmail(p.getUser().getEmail());
        }

        // Add guest details if available
        if (p.getGuest() != null) {
            dto.setGuestName(p.getGuest().getPseudo());
        }

        com.quizbackend.entity.Quiz q = p.getQuiz();
        if (q != null) {
            QuizSummary qs = new QuizSummary();
            qs.setId(q.getId());
            qs.setTitle(q.getTitle());
            qs.setCode(q.getCode());
            dto.setQuiz(qs);
        }

        return dto;
    }
}
