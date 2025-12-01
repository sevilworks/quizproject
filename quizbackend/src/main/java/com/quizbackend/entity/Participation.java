package com.quizbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "participations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "quiz_id", nullable = false)
    private Integer quizId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "guest_id")
    private Integer guestId;

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "is_fraud", nullable = false)
    private Boolean isFraud = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "student_responses", columnDefinition = "TEXT")
    private String studentResponses;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"participations", "questions", "professor"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", insertable = false, updatable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", insertable = false, updatable = false)
    private Guest guest;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isFraud == null) {
            isFraud = false;
        }
    }
}