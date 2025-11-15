package com.quizbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StudentStatsDTO {
    private Integer id;
    private String studentName;
    private String username;
    private int totalQuizzes;
    private BigDecimal averageScore;
    private int currentStreak;
    private BigDecimal bestScore;
    private int perfectQuizzes;
    private BigDecimal successRate;
    private LocalDateTime createdAt;

    // Constructors
    public StudentStatsDTO() {}

    public StudentStatsDTO(String studentName, String username, int totalQuizzes,
                          BigDecimal averageScore, int currentStreak, BigDecimal bestScore,
                          int perfectQuizzes, BigDecimal successRate) {
        this.studentName = studentName;
        this.username = username;
        this.totalQuizzes = totalQuizzes;
        this.averageScore = averageScore;
        this.currentStreak = currentStreak;
        this.bestScore = bestScore;
        this.perfectQuizzes = perfectQuizzes;
        this.successRate = successRate;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getTotalQuizzes() { return totalQuizzes; }
    public void setTotalQuizzes(int totalQuizzes) { this.totalQuizzes = totalQuizzes; }

    public BigDecimal getAverageScore() { return averageScore; }
    public void setAverageScore(BigDecimal averageScore) { this.averageScore = averageScore; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public BigDecimal getBestScore() { return bestScore; }
    public void setBestScore(BigDecimal bestScore) { this.bestScore = bestScore; }

    public int getPerfectQuizzes() { return perfectQuizzes; }
    public void setPerfectQuizzes(int perfectQuizzes) { this.perfectQuizzes = perfectQuizzes; }

    public BigDecimal getSuccessRate() { return successRate; }
    public void setSuccessRate(BigDecimal successRate) { this.successRate = successRate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}