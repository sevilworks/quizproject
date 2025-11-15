package com.quizbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuizHistoryDTO {
    private Integer participationId;
    private Integer quizId;
    private String quizTitle;
    private String quizDescription;
    private BigDecimal score;
    private LocalDateTime completedAt;
    private String professorName;
    private int rank;
    private int totalParticipants;

    // Constructors
    public QuizHistoryDTO() {}

    public QuizHistoryDTO(Integer participationId, Integer quizId, String quizTitle,
                         String quizDescription, BigDecimal score, LocalDateTime completedAt,
                         String professorName, int rank, int totalParticipants) {
        this.participationId = participationId;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.quizDescription = quizDescription;
        this.score = score;
        this.completedAt = completedAt;
        this.professorName = professorName;
        this.rank = rank;
        this.totalParticipants = totalParticipants;
    }

    // Getters and Setters
    public Integer getParticipationId() { return participationId; }
    public void setParticipationId(Integer participationId) { this.participationId = participationId; }

    public Integer getQuizId() { return quizId; }
    public void setQuizId(Integer quizId) { this.quizId = quizId; }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }

    public String getQuizDescription() { return quizDescription; }
    public void setQuizDescription(String quizDescription) { this.quizDescription = quizDescription; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public int getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }
}