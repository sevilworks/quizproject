package com.quizbackend.controller;

import com.quizbackend.dto.ParticipationDto;
import com.quizbackend.dto.QuizHistoryDTO;
import com.quizbackend.dto.StudentStatsDTO;
import com.quizbackend.entity.Quiz;
import com.quizbackend.entity.Student;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final com.quizbackend.service.StudentService studentService;

    /**
     * Récupère les informations du profil de l'étudiant connecté
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving profile for: {}", username);

            Student student = studentService.getStudentByUsername(username);

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", student.getId());
            profile.put("firstName", student.getFirstName());
            profile.put("lastName", student.getLastName());
            profile.put("username", student.getUser().getUsername());
            profile.put("email", student.getUser().getEmail());
            profile.put("createdAt", student.getCreatedAt());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error retrieving profile: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Met à jour le profil de l'étudiant
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> updates
    ) {
        try {
            String username = authentication.getName();
            String firstName = updates.get("firstName");
            String lastName = updates.get("lastName");

            log.info("Updating profile for: {}", username);

            Student student = studentService.updateStudentProfile(username, firstName, lastName);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("firstName", student.getFirstName());
            response.put("lastName", student.getLastName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating profile: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère les statistiques de l'étudiant connecté
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStudentStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("DEBUG: Controller - Retrieving statistics for username: {}", username);

            StudentStatsDTO stats = studentService.getStudentStats(username);
            log.info("DEBUG: Controller - Retrieved stats for {}: totalQuizzes={}, averageScore={}", username, stats.getTotalQuizzes(), stats.getAverageScore());
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            log.error("Student not found: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Student not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error retrieving statistics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère les statistiques détaillées
     */
    @GetMapping("/stats/detailed")
    public ResponseEntity<?> getDetailedStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving detailed statistics for: {}", username);

            StudentStatsDTO stats = studentService.getDetailedStats(username);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving detailed statistics: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving detailed statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère l'historique des quiz de l'étudiant
     */
    @GetMapping("/history")
    public ResponseEntity<?> getQuizHistory(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving quiz history for: {}", username);

            List<QuizHistoryDTO> history = studentService.getQuizHistory(username);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            log.error("Student not found: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Student not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error retrieving history: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving history: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère les détails d'une participation spécifique
     */
    @GetMapping("/participation/{id}")
    public ResponseEntity<?> getParticipationDetails(
            Authentication authentication,
            @PathVariable Integer id
    ) {
        try {
            String username = authentication.getName();
            log.info("Retrieving participation details {} for: {}", id, username);

            ParticipationDto participation = studentService.getParticipationDetails(username, id);
            return ResponseEntity.ok(participation);
        } catch (RuntimeException e) {
            log.error("Error: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error retrieving participation details: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving participation details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère le classement global
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit
    ) {
        try {
            log.info("Retrieving global leaderboard (limit: {})", limit);

            List<StudentStatsDTO> leaderboard = studentService.getGlobalLeaderboard(limit);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            log.error("Error retrieving leaderboard: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving leaderboard: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère les étudiants les plus actifs
     */
    @GetMapping("/most-active")
    public ResponseEntity<?> getMostActiveStudents(
            @RequestParam(defaultValue = "10") int limit
    ) {
        try {
            log.info("Retrieving most active students (limit: {})", limit);

            List<StudentStatsDTO> activeStudents = studentService.getMostActiveStudents(limit);
            return ResponseEntity.ok(activeStudents);
        } catch (Exception e) {
            log.error("Error retrieving most active students: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving most active students: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère les quiz recommandés pour l'étudiant
     */
    @GetMapping("/recommended-quizzes")
    public ResponseEntity<?> getRecommendedQuizzes(
            Authentication authentication,
            @RequestParam(defaultValue = "5") int limit
    ) {
        try {
            String username = authentication.getName();
            log.info("Retrieving recommended quizzes for: {} (limit: {})", username, limit);

            List<Quiz> recommendedQuizzes = studentService.getRecommendedQuizzes(username, limit);
            return ResponseEntity.ok(recommendedQuizzes);
        } catch (Exception e) {
            log.error("Error retrieving recommended quizzes: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving recommended quizzes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Vérifie si l'étudiant peut participer à un quiz
     */
    @GetMapping("/quiz/{id}/can-participate")
    public ResponseEntity<?> canParticipate(
            Authentication authentication,
            @PathVariable Integer id
    ) {
        try {
            String username = authentication.getName();
            log.debug("Checking participation for quiz {} by: {}", id, username);

            boolean canParticipate = studentService.canParticipateInQuiz(username, id);

            Map<String, Object> response = new HashMap<>();
            response.put("canParticipate", canParticipate);
            response.put("message", canParticipate ?
                    "You can participate in this quiz" :
                    "You have already participated in this quiz");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking participation: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error checking participation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Récupère le nombre total de quiz disponibles
     */
    @GetMapping("/stats/summary")
    public ResponseEntity<?> getStatsSummary(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving statistics summary for: {}", username);

            StudentStatsDTO stats = studentService.getStudentStats(username);

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalQuizzes", stats.getTotalQuizzes());
            summary.put("averageScore", stats.getAverageScore());
            summary.put("currentStreak", stats.getCurrentStreak());
            summary.put("successRate", stats.getSuccessRate());

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error retrieving statistics summary: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving statistics summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}