package com.quizbackend.controller;

import com.quizbackend.entity.Quiz;
import com.quizbackend.entity.Question;
import com.quizbackend.entity.Response;
import com.quizbackend.entity.Participation;
import com.quizbackend.entity.Professor;
import com.quizbackend.entity.User;
import com.quizbackend.service.QuizService;
import com.quizbackend.dto.ParticipationDto;
import com.quizbackend.dto.SubmitQuizRequest;
import com.quizbackend.service.AuthService;
import com.quizbackend.service.ProfessorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ProfessorService professorService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Helper method to get professor ID from username
    private Integer getProfessorId(String username) {
        try {
            Professor professor = professorService.getProfessorByUsername(username);
            if (professor == null) {
                throw new RuntimeException("Professor not found for username: " + username);
            }
            return professor.getUserId();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get professor ID: " + e.getMessage());
        }
    }

    // Professor endpoints
    @PostMapping("/create")
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz, Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer professorId = getProfessorId(username);
            
            Quiz createdQuiz = quizService.createQuiz(quiz, professorId);
            return ResponseEntity.ok(createdQuiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<?> updateQuiz(@PathVariable Integer quizId, @RequestBody Quiz quiz, Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer professorId = getProfessorId(username);
            
            Quiz updatedQuiz = quizService.updateQuiz(quizId, quiz, professorId);
            return ResponseEntity.ok(updatedQuiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Integer quizId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer professorId = getProfessorId(username);
            
            quizService.deleteQuiz(quizId, professorId);
            return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-quizzes")
    public ResponseEntity<?> getMyQuizzes(Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer professorId = getProfessorId(username);
            
            List<Quiz> quizzes = quizService.getQuizzesByProfessor(professorId);
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
@PostMapping("/{quizId}/questions")
public ResponseEntity<?> addQuestion(@PathVariable Integer quizId, @RequestBody Map<String, Object> rawJson, Authentication authentication) {
    System.out.println("Raw JSON received: " + rawJson);
    // Convert to Question manually
    Question question = new Question();
    question.setQuestionText((String) rawJson.get("questionText"));
    question.setQuizId(quizId);
    
    try {
        String username = authentication.getName();
        Integer professorId = getProfessorId(username);
        Question createdQuestion = quizService.addQuestion(quizId, question, professorId);
        return ResponseEntity.ok(createdQuestion);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
    @PostMapping("/questions/{questionId}/responses")
    public ResponseEntity<?> addResponse(@PathVariable Integer questionId, @RequestBody Response response, Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer professorId = getProfessorId(username);
            
            Response createdResponse = quizService.addResponse(questionId, response, professorId);
            return ResponseEntity.ok(createdResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{quizId}/participations")
    public ResponseEntity<?> getQuizParticipations(@PathVariable Integer quizId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer professorId = getProfessorId(username);
            
            List<Participation> participations = quizService.getQuizParticipations(quizId, professorId);
            // Map to DTOs to avoid returning JPA entities (prevents Hibernate proxy serialization issues)
            java.util.List<ParticipationDto> dtos = new java.util.ArrayList<>();
            for (Participation p : participations) {
                ParticipationDto dto = new ParticipationDto();
                dto.setId(p.getId());
                dto.setScore(p.getScore());
                dto.setCreatedAt(p.getCreatedAt());
                dto.setUserId(p.getUserId());
                dto.setGuestId(p.getGuestId());
                // Removed studentId field as it's no longer used
                // fetch quiz summary via service to avoid lazy-loading proxies
                Quiz q = quizService.getQuizById(p.getQuizId());
                if (q != null) {
                    ParticipationDto.QuizSummary qs = new ParticipationDto.QuizSummary();
                    qs.setId(q.getId());
                    qs.setTitle(q.getTitle());
                    qs.setCode(q.getCode());
                    dto.setQuiz(qs);
                }
                dtos.add(dto);
            }

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Public endpoints for joining quizzes
    @GetMapping("/join/{code}")
    public ResponseEntity<?> getQuizByCode(@PathVariable String code) {
        try {
            return quizService.getQuizByCode(code)
                    .map(quiz -> ResponseEntity.ok(quiz))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/join/{code}")
    public ResponseEntity<?> participateByCode(@PathVariable String code, Authentication authentication) {
        try {
            Integer userId = null;
            if (authentication != null) {
                String username = authentication.getName();
                userId = authService.getCurrentUser(username).getId();
            }
            Participation participation = quizService.registerParticipationByCode(code, userId, null, null);
            // Map to DTO
            ParticipationDto dto = new ParticipationDto();
            dto.setId(participation.getId());
            dto.setScore(participation.getScore());
            dto.setCreatedAt(participation.getCreatedAt());
            dto.setUserId(participation.getUserId());
            dto.setGuestId(participation.getGuestId());
            // Removed studentId field as it's no longer used
            Quiz q = quizService.getQuizById(participation.getQuizId());
            if (q != null) {
                ParticipationDto.QuizSummary qs = new ParticipationDto.QuizSummary();
                qs.setId(q.getId());
                qs.setTitle(q.getTitle());
                qs.setCode(q.getCode());
                dto.setQuiz(qs);
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Integer quizId, @RequestBody String rawJson, Authentication authentication) {
        try {
            // Add logging to debug deserialization
            System.out.println("🔍 Raw JSON request body: " + rawJson);
            SubmitQuizRequest request = objectMapper.readValue(rawJson, SubmitQuizRequest.class);
            System.out.println("🔍 SubmitQuizRequest received: " + request);
            if (request != null) {
                System.out.println("🔍 SelectedResponseIds: " + request.getSelectedResponseIds());
                System.out.println("🔍 GuestId: " + request.getGuestId());
                if (request.getSelectedResponseIds() != null) {
                    System.out.println("🔍 SelectedResponseIds size: " + request.getSelectedResponseIds().size());
                    System.out.println("🔍 SelectedResponseIds values: " + request.getSelectedResponseIds());
                }
            }

            Integer userId = null;
            if (authentication != null) {
                String username = authentication.getName();
                userId = authService.getCurrentUser(username).getId();
            }

            if (request == null) {
                System.out.println("❌ Request is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Request must not be null"));
            }

            if (request.getSelectedResponseIds() == null) {
                System.out.println("❌ SelectedResponseIds is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Ids must not be null"));
            }

            if (request.getSelectedResponseIds().isEmpty()) {
                System.out.println("❌ SelectedResponseIds is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "Ids must not be empty"));
            }

            Participation participation = quizService.submitQuizAnswers(quizId, request.getSelectedResponseIds(), userId, request.getGuestId(), null, request.getStudentResponses());
            // Map to DTO
            ParticipationDto dto = new ParticipationDto();
            dto.setId(participation.getId());
            dto.setScore(participation.getScore());
            dto.setCreatedAt(participation.getCreatedAt());
            dto.setUserId(participation.getUserId());
            dto.setGuestId(participation.getGuestId());
            // Removed studentId field as it's no longer used
            Quiz q = quizService.getQuizById(participation.getQuizId());
            if (q != null) {
                ParticipationDto.QuizSummary qs = new ParticipationDto.QuizSummary();
                qs.setId(q.getId());
                qs.setTitle(q.getTitle());
                qs.setCode(q.getCode());
                dto.setQuiz(qs);
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuizById(@PathVariable Integer quizId) {
        try {
            Quiz quiz = quizService.getQuizById(quizId);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Public endpoints
    @GetMapping("/public")
    public ResponseEntity<?> getPublicQuizzes() {
        try {
            List<Quiz> quizzes = quizService.getPublicQuizzes();
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuizQuestions(@PathVariable Integer id) {
        try {
            // For now, allow access without authentication. In future, check if user has access
            Quiz quiz = quizService.getQuizByIdWithQuestions(id);
            // Return quiz with questions (assuming lazy loading or eager fetch)
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<?> startQuiz(@PathVariable Integer quizId, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = authService.getCurrentUser(username);
            Participation participation = quizService.startQuizParticipation(quizId, user.getId(), null);
            // Map to DTO
            ParticipationDto dto = new ParticipationDto();
            dto.setId(participation.getId());
            dto.setScore(participation.getScore());
            dto.setCreatedAt(participation.getCreatedAt());
            dto.setUserId(participation.getUserId());
            dto.setGuestId(participation.getGuestId());
            // Removed studentId field as it's no longer used
            Quiz q = quizService.getQuizById(participation.getQuizId());
            if (q != null) {
                ParticipationDto.QuizSummary qs = new ParticipationDto.QuizSummary();
                qs.setId(q.getId());
                qs.setTitle(q.getTitle());
                qs.setCode(q.getCode());
                dto.setQuiz(qs);
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Student endpoints
    @GetMapping("/my-participations")
    public ResponseEntity<?> getMyParticipations(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = authService.getCurrentUser(username);
            List<Participation> participations = quizService.getUserParticipations(user.getId());
            List<ParticipationDto> dtos = participations.stream().map(p -> {
                ParticipationDto dto = new ParticipationDto();
                dto.setId(p.getId());
                dto.setScore(p.getScore());
                dto.setCreatedAt(p.getCreatedAt());
                dto.setUserId(p.getUserId());
                dto.setGuestId(p.getGuestId());
                // Removed studentId field as it's no longer used
                Quiz q = quizService.getQuizById(p.getQuizId());
                if (q != null) {
                    ParticipationDto.QuizSummary qs = new ParticipationDto.QuizSummary();
                    qs.setId(q.getId());
                    qs.setTitle(q.getTitle());
                    qs.setCode(q.getCode());
                    dto.setQuiz(qs);
                }
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}