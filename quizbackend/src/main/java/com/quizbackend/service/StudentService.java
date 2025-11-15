package com.quizbackend.service;

import com.quizbackend.dto.ParticipationDto;
import com.quizbackend.dto.QuizHistoryDTO;
import com.quizbackend.dto.StudentStatsDTO;
import com.quizbackend.entity.*;
import com.quizbackend.repository.ParticipationRepository;
import com.quizbackend.repository.QuizRepository;
import com.quizbackend.repository.StudentRepository;
import com.quizbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ParticipationRepository participationRepository;
    private final QuizRepository quizRepository;
    private final AuthService authService;

    /**
     * Récupère un étudiant par son ID
     */
    public Student getStudentById(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    /**
     * Récupère un étudiant par son username
       */
     public Student getStudentByUsername(String username) {
         logger.debug("Retrieving student with username: {}", username);

         User user = userRepository.findByUsername(username)
                 .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

         logger.debug("Found user: id={}, username={}, role={}", user.getId(), user.getUsername(), user.getRole());

         if (user.getRole() != User.Role.STUDENT) {
             logger.warn("User {} has role {} but trying to access as student", username, user.getRole());
             throw new RuntimeException("User is not a student");
         }

         Optional<Student> studentOpt = studentRepository.findByUser(user);
         if (studentOpt.isEmpty()) {
             logger.error("Student profile not found for user: id={}, username={}, role={}. Checking if Student exists by userId...",
                     user.getId(), user.getUsername(), user.getRole());
             // Additional check: try findByUserId as fallback
             Optional<Student> studentById = studentRepository.findByUserId(user.getId());
             if (studentById.isPresent()) {
                 logger.warn("Student found by userId but not by user entity. Data inconsistency detected.");
                 // Fix the broken relationship by setting the user reference
                 Student brokenStudent = studentById.get();
                 brokenStudent.setUser(user);
                 user.setStudent(brokenStudent);
                 userRepository.save(user);
                 logger.info("Fixed broken Student-User relationship for userId={}", user.getId());
                 return brokenStudent;
             } else {
                 logger.warn("No Student entity found for userId={}. Creating missing Student profile as fallback.", user.getId());
                 // Fallback: Create missing Student profile for existing STUDENT user
                 try {
                     Student createdStudent = createStudent(user, "", "");
                     logger.info("Successfully created missing Student profile for user: id={}, username={}", user.getId(), user.getUsername());
                     return createdStudent;
                 } catch (Exception e) {
                     logger.error("Failed to create missing Student profile for userId={}: {}", user.getId(), e.getMessage());
                     throw new RuntimeException("Student profile not found and could not be created");
                 }
             }
         }

         Student student = studentOpt.get();
         logger.debug("Found student: id={}, userId={}", student.getId(), student.getUser().getId());
         return student;
     }

    /**
     * Récupère un étudiant par son ID utilisateur
     */
    public Student getStudentByUserId(Integer userId) {
        logger.debug("Retrieving student with userId: {}", userId);

        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found for userId: " + userId));
    }

    /**
     * Crée un nouvel étudiant
     */
    public Student createStudent(User user, String firstName, String lastName) {
        logger.info("Creating Student entity for userId={}, firstName={}, lastName={}", user.getId(), firstName, lastName);

        Student student = new Student();
        student.setUser(user);
        student.setFirstName(firstName);
        student.setLastName(lastName);

        // Establish bidirectional relationship
        user.setStudent(student);

        // Save user to cascade save the student with proper relationship
        User savedUser = userRepository.save(user);
        Student saved = savedUser.getStudent();
        logger.info("Saved Student: id={}, userId={}, firstName={}, lastName={}",
                    saved.getId(), saved.getUser() != null ? saved.getUser().getId() : "NULL", saved.getFirstName(), saved.getLastName());
        return saved;
    }

    /**
     * Met à jour le profil de l'étudiant
     */
    public Student updateStudentProfile(String username, String firstName, String lastName) {
        logger.info("Updating profile for: {}", username);

        Student student = getStudentByUsername(username);

        if (firstName != null && !firstName.trim().isEmpty()) {
            student.setFirstName(firstName.trim());
        }

        if (lastName != null && !lastName.trim().isEmpty()) {
            student.setLastName(lastName.trim());
        }

        Student updatedStudent = studentRepository.save(student);
        logger.info("Profile updated successfully for: {}", username);

        return updatedStudent;
    }

    /**
     * Met à jour un étudiant
     */
    public Student updateStudent(Integer id, String firstName, String lastName) {
        Student student = getStudentById(id);
        student.setFirstName(firstName);
        student.setLastName(lastName);
        return studentRepository.save(student);
    }

    /**
     * Récupère tous les étudiants
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Récupère les statistiques complètes d'un étudiant
       */
      public StudentStatsDTO getStudentStats(String username) {
          try {
              logger.info("Calculating statistics for student: {}", username);

              Student student = getStudentByUsername(username);
              logger.debug("Student found: id={}, userId={}", student.getId(), student.getUser().getId());

              // Use repository queries for better performance
              Integer userId = student.getUser().getId();
              logger.info("DEBUG: Using userId {} for statistics calculation - username: {}", userId, username);
              logger.debug("DEBUG: About to query participations for userId: {}", userId);
              long totalQuizzes = participationRepository.countByUserId(userId);
              logger.info("DEBUG: countByUserId({}) returned: {}", userId, totalQuizzes);
              BigDecimal averageScore = participationRepository.averageScoreByUserId(userId);
              logger.info("DEBUG: averageScoreByUserId({}) returned: {}", userId, averageScore);
              BigDecimal bestScore = participationRepository.maxScoreByUserId(userId);
              logger.info("DEBUG: maxScoreByUserId({}) returned: {}", userId, bestScore);
              long perfectQuizzes = participationRepository.countPerfectScoresByUserId(userId);
              logger.info("DEBUG: countPerfectScoresByUserId({}) returned: {}", userId, perfectQuizzes);

              // Only fetch full participations for streak calculation
               List<Participation> participations = participationRepository.findByUserIdOrderByCreatedAtDesc(userId);

              logger.debug("Found {} participations for student {}", participations.size(), username);

              // Add debug logging for participation scores
              for (Participation p : participations) {
                  logger.debug("Participation ID: {}, Score: {}, CreatedAt: {}", p.getId(), p.getScore(), p.getCreatedAt());
              }

              StudentStatsDTO stats = new StudentStatsDTO();

              // Informations de l'étudiant
              stats.setStudentName(student.getFirstName() != null && student.getLastName() != null
                  ? student.getFirstName() + " " + student.getLastName()
                  : student.getUser().getUsername());
              stats.setUsername(student.getUser().getUsername());

              // Nombre total de quiz complétés
              stats.setTotalQuizzes((int) totalQuizzes);

              // Score moyen
              stats.setAverageScore(averageScore != null ? averageScore : BigDecimal.ZERO);

              // Série actuelle (streak)
              stats.setCurrentStreak(calculateStreak(participations));

              // Meilleur score
              stats.setBestScore(bestScore != null ? bestScore : BigDecimal.ZERO);

              // Nombre de quiz parfaits (score = 100%)
              stats.setPerfectQuizzes((int) perfectQuizzes);

              // Taux de réussite moyen (en pourcentage)
              stats.setSuccessRate(calculateSuccessRate(participations));

              stats.setCreatedAt(student.getCreatedAt());

              logger.info("Statistics calculated successfully for {}: {} quizzes, {}% success rate",
                      username, stats.getTotalQuizzes(), stats.getSuccessRate());

              return stats;
          } catch (Exception e) {
              logger.error("Error in getStudentStats for username {}: {}", username, e.getMessage(), e);
              throw e;
          }
      }

    /**
     * Récupère les statistiques détaillées d'un étudiant
     */
    public StudentStatsDTO getDetailedStats(String username) {
        logger.info("Retrieving detailed statistics for: {}", username);
        return getStudentStats(username);
    }

    /**
     * Calcule le score moyen
     */
    private BigDecimal calculateAverageScore(List<Participation> participations) {
        if (participations.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalScore = participations.stream()
                .map(Participation::getScore)
                .filter(score -> score != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalScore.divide(
                new BigDecimal(participations.size()),
                2,
                RoundingMode.HALF_UP
        );
    }

    /**
     * Calcule la série de jours consécutifs avec au moins un quiz
     */
    private int calculateStreak(List<Participation> participations) {
        if (participations.isEmpty()) {
            return 0;
        }

        // Trier les participations par date décroissante
        List<LocalDate> dates = participations.stream()
                .map(p -> p.getCreatedAt().toLocalDate())
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        if (dates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // Vérifier si l'étudiant a fait un quiz aujourd'hui ou hier
        if (!dates.get(0).equals(today) && !dates.get(0).equals(yesterday)) {
            return 0;
        }

        int streak = 1;
        for (int i = 0; i < dates.size() - 1; i++) {
            long daysBetween = ChronoUnit.DAYS.between(dates.get(i + 1), dates.get(i));
            if (daysBetween == 1) {
                streak++;
            } else {
                break;
            }
        }

        logger.debug("Calculated streak: {} days", streak);
        return streak;
    }

    /**
     * Calcule le meilleur score obtenu
     */
    private BigDecimal calculateBestScore(List<Participation> participations) {
        return participations.stream()
                .map(Participation::getScore)
                .filter(score -> score != null)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * Compte le nombre de quiz avec un score parfait (100%)
     */
    private int calculatePerfectQuizzes(List<Participation> participations) {
        return (int) participations.stream()
                .filter(p -> p.getScore() != null)
                .filter(p -> p.getScore().compareTo(new BigDecimal("100")) == 0)
                .count();
    }

    /**
     * Calcule le taux de réussite moyen (en pourcentage)
     */
    private BigDecimal calculateSuccessRate(List<Participation> participations) {
        if (participations.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalScore = participations.stream()
                .map(Participation::getScore)
                .filter(score -> score != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Score maximum par quiz = 100
        BigDecimal maxPossibleScore = new BigDecimal(participations.size() * 100);

        if (maxPossibleScore.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return totalScore.divide(maxPossibleScore, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Récupère l'historique des quiz d'un étudiant
      */
     public List<QuizHistoryDTO> getQuizHistory(String username) {
         logger.info("Retrieving quiz history for: {}", username);

         Student student = getStudentByUsername(username);
         logger.debug("Retrieved student: id={}, userId={}", student.getId(), student.getUser().getId());
         List<Participation> participations = participationRepository.findByUserId(student.getUser().getId());

        logger.debug("Found {} participations for userId {}", participations.size(), student.getUser().getId());
        List<QuizHistoryDTO> history = participations.stream()
                .sorted(Comparator.comparing(Participation::getCreatedAt).reversed())
                .map(this::convertToQuizHistoryDTO)
                .collect(Collectors.toList());

        logger.info("History retrieved: {} participations", history.size());
        return history;
    }

    /**
     * Récupère les détails d'une participation spécifique
     */
    public ParticipationDto getParticipationDetails(String username, Integer participationId) {
        logger.debug("Retrieving participation details {} for {}", participationId, username);

        Student student = getStudentByUsername(username);
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        // Vérifier que la participation appartient bien à l'étudiant
        if (!participation.getUserId().equals(student.getUser().getId())) {
            throw new RuntimeException("Unauthorized access to this participation");
        }

        return convertToParticipationDTO(participation);
    }

    /**
     * Récupère le classement global des étudiants
     */
    public List<StudentStatsDTO> getGlobalLeaderboard(int limit) {
        logger.info("Retrieving global leaderboard (limit: {})", limit);

        List<Object[]> results = participationRepository.findLeaderboardByAverageScore();

        List<StudentStatsDTO> leaderboard = results.stream()
                .limit(limit)
                .map(row -> {
                    Integer userId = (Integer) row[0];
                    Long totalQuizzes = (Long) row[1];
                    BigDecimal averageScore = (BigDecimal) row[2];

                    // Get student info
                    Student student = studentRepository.findByUserId(userId).orElse(null);
                    if (student == null) return null;

                    StudentStatsDTO stats = new StudentStatsDTO();
                    stats.setStudentName(student.getFirstName() != null && student.getLastName() != null
                        ? student.getFirstName() + " " + student.getLastName()
                        : student.getUser().getUsername());
                    stats.setUsername(student.getUser().getUsername());
                    stats.setTotalQuizzes(totalQuizzes.intValue());
                    stats.setAverageScore(averageScore);

                    return stats;
                })
                .filter(stats -> stats != null)
                .collect(Collectors.toList());

        logger.info("Leaderboard retrieved: {} students", leaderboard.size());
        return leaderboard;
    }

    /**
     * Récupère les étudiants les plus actifs
     */
    public List<StudentStatsDTO> getMostActiveStudents(int limit) {
        logger.info("Retrieving most active students (limit: {})", limit);

        List<Object[]> results = participationRepository.findMostActiveByParticipationCount();

        return results.stream()
                .limit(limit)
                .map(row -> {
                    Integer userId = (Integer) row[0];
                    Long totalQuizzes = (Long) row[1];
                    BigDecimal averageScore = (BigDecimal) row[2];

                    // Get student info
                    Student student = studentRepository.findByUserId(userId).orElse(null);
                    if (student == null) return null;

                    StudentStatsDTO stats = new StudentStatsDTO();
                    stats.setStudentName(student.getFirstName() != null && student.getLastName() != null
                        ? student.getFirstName() + " " + student.getLastName()
                        : student.getUser().getUsername());
                    stats.setUsername(student.getUser().getUsername());
                    stats.setTotalQuizzes(totalQuizzes.intValue());
                    stats.setAverageScore(averageScore);

                    return stats;
                })
                .filter(stats -> stats != null)
                .collect(Collectors.toList());
    }

    /**
     * Vérifie si un étudiant peut participer à un quiz
      */
     public boolean canParticipateInQuiz(String username, Integer quizId) {
         logger.debug("Checking participation possibility for quiz {} by {}", quizId, username);

         Student student = getStudentByUsername(username);
         List<Participation> participations = participationRepository.findByUserId(student.getUser().getId());

        boolean alreadyParticipated = participations.stream()
                .anyMatch(p -> p.getQuiz().getId().equals(quizId));

        logger.debug("Student {} {} already participated in quiz {}",
                username, alreadyParticipated ? "has" : "has not", quizId);

        return !alreadyParticipated;
    }

    /**
     * Enregistre une nouvelle participation
     */
    public Participation createParticipation(String username, Integer quizId, BigDecimal score) {
        logger.info("Creating new participation for {} in quiz {}", username, quizId);

        Student student = getStudentByUsername(username);

        if (!canParticipateInQuiz(username, quizId)) {
            throw new RuntimeException("Student has already participated in this quiz");
        }

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));

        Participation participation = new Participation();
        participation.setUserId(student.getUser().getId());
        participation.setQuiz(quiz);
        participation.setScore(score);
        participation.setCreatedAt(LocalDateTime.now());

        Participation savedParticipation = participationRepository.save(participation);
        logger.info("Participation created successfully: ID {}", savedParticipation.getId());

        return savedParticipation;
    }

    /**
     * Récupère les quiz recommandés pour un étudiant (quiz non encore complétés)
      */
     public List<Quiz> getRecommendedQuizzes(String username, int limit) {
         logger.info("Retrieving recommended quizzes for: {} (limit: {})", username, limit);

         Student student = getStudentByUsername(username);
         List<Participation> completedParticipations = participationRepository
                 .findByUserId(student.getUser().getId());

        // Récupérer les IDs des quiz déjà complétés
        List<Integer> completedQuizIds = completedParticipations.stream()
                .map(p -> p.getQuiz().getId())
                .collect(Collectors.toList());

        // Récupérer tous les quiz non complétés, triés par date de création (les plus récents en premier)
        List<Quiz> allQuizzes = quizRepository.findAll();

        List<Quiz> recommendedQuizzes = allQuizzes.stream()
                .filter(quiz -> !completedQuizIds.contains(quiz.getId()))
                .sorted(Comparator.comparing(Quiz::getCreatedAt).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        logger.info("{} recommended quizzes found", recommendedQuizzes.size());
        return recommendedQuizzes;
    }

    /**
     * Supprime un étudiant
     */
    public void deleteStudent(Integer studentId) {
        logger.warn("Deleting student with ID: {}", studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        studentRepository.delete(student);
        logger.info("Student deleted successfully: {}", studentId);
    }

    /**
     * Compte le nombre total d'étudiants
     */
    public long countStudents() {
        long count = studentRepository.count();
        logger.debug("Total student count: {}", count);
        return count;
    }

    /**
     * Recherche des étudiants par nom
     */
    public List<Student> searchStudentsByName(String searchTerm) {
        logger.info("Searching students with term: {}", searchTerm);

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return List.of();
        }

        String normalizedTerm = searchTerm.trim().toLowerCase();

        List<Student> results = studentRepository.findAll().stream()
                .filter(student ->
                        student.getFirstName().toLowerCase().contains(normalizedTerm) ||
                                student.getLastName().toLowerCase().contains(normalizedTerm) ||
                                student.getUser().getUsername().toLowerCase().contains(normalizedTerm) ||
                                student.getUser().getEmail().toLowerCase().contains(normalizedTerm)
                )
                .collect(Collectors.toList());

        logger.info("{} students found for term '{}'", results.size(), searchTerm);
        return results;
    }

    /**
     * Vérifie si un étudiant existe
     */
    public boolean existsByUsername(String username) {
        try {
            getStudentByUsername(username);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    /**
     * Convertit une Participation en ParticipationDTO
     */
    private ParticipationDto convertToParticipationDTO(Participation participation) {
        ParticipationDto dto = ParticipationDto.fromEntity(participation);
        if (dto != null) {
            dto.setCompletedAt(participation.getCreatedAt());

            // Calculer le nombre de questions et de réponses correctes
            if (participation.getQuiz().getQuestions() != null) {
                int questionCount = participation.getQuiz().getQuestions().size();
                dto.setQuestionCount(questionCount);

                // Calculer le nombre de réponses correctes basé sur le score
                if (participation.getScore() != null && questionCount > 0) {
                    BigDecimal percentage = participation.getScore(); // Le score est déjà en pourcentage (0-100)
                    int correctAnswers = percentage
                            .multiply(new BigDecimal(questionCount))
                            .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP)
                            .intValue();
                    dto.setCorrectAnswers(correctAnswers);
                }
            }

            dto.setDuration(participation.getQuiz().getDuration());
        }

        return dto;
    }

    /**
     * Convertit une Participation en QuizHistoryDTO
     */
    private QuizHistoryDTO convertToQuizHistoryDTO(Participation participation) {
        QuizHistoryDTO dto = new QuizHistoryDTO();
        dto.setParticipationId(participation.getId());
        dto.setQuizId(participation.getQuiz().getId());
        dto.setQuizTitle(participation.getQuiz().getTitle());
        dto.setQuizDescription(participation.getQuiz().getDescription());
        dto.setScore(participation.getScore());
        dto.setCompletedAt(participation.getCreatedAt());

        // Nom du professeur
        if (participation.getQuiz().getProfessor() != null) {
            String professorName = participation.getQuiz().getProfessor().getFirstName() + " " +
                    participation.getQuiz().getProfessor().getLastName();
            dto.setProfessorName(professorName);
        } else {
            dto.setProfessorName("Unknown Professor");
        }

        // Calculer le rang (position dans le classement pour ce quiz)
        List<Participation> allParticipations = participationRepository
                .findByQuizId(participation.getQuiz().getId());

        long rank = allParticipations.stream()
                .filter(p -> p.getScore() != null && participation.getScore() != null)
                .filter(p -> p.getScore().compareTo(participation.getScore()) > 0)
                .count() + 1;

        dto.setRank((int) rank);
        dto.setTotalParticipants(allParticipations.size());

        return dto;
    }
}
