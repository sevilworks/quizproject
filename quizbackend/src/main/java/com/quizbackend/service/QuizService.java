package com.quizbackend.service;

import com.quizbackend.entity.*;
import com.quizbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ResponseRepository responseRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private StudentRepository studentRepository;

    public Quiz createQuiz(Quiz quiz, Integer professorId) {
        // Generate unique quiz code
        String code = generateUniqueQuizCode();
        quiz.setCode(code);
        quiz.setProfessorId(professorId);
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(Integer quizId, Quiz updatedQuiz, Integer professorId) {
        Quiz existingQuiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!existingQuiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to update this quiz");
        }

        if (updatedQuiz.getTitle() != null && !updatedQuiz.getTitle().trim().isEmpty()) {
            existingQuiz.setTitle(updatedQuiz.getTitle());
        }
        if (updatedQuiz.getDescription() != null) {
            existingQuiz.setDescription(updatedQuiz.getDescription());
        }
        if (updatedQuiz.getDuration() != null && updatedQuiz.getDuration() > 0) {
            existingQuiz.setDuration(updatedQuiz.getDuration());
        }
        if (updatedQuiz.getStatus() != null) {
            existingQuiz.setStatus(updatedQuiz.getStatus());
        }

        return quizRepository.save(existingQuiz);
    }

    // Overloaded admin convenience method (no ownership check, simplified params)
    public Quiz createQuiz(String title, String description, Integer professorId) {
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setProfessorId(professorId);
        String code = generateUniqueQuizCode();
        quiz.setCode(code);
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(Integer quizId, String title, String description) {
        Quiz existingQuiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        if (title != null) existingQuiz.setTitle(title);
        if (description != null) existingQuiz.setDescription(description);
        return quizRepository.save(existingQuiz);
    }

    public void deleteQuiz(Integer quizId, Integer professorId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (professorId != null && !quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to delete this quiz");
        }

        quizRepository.delete(quiz);
    }

    public List<Quiz> getQuizzesByProfessor(Integer professorId) {
        return quizRepository.findByProfessorId(professorId);
    }

    public Optional<Quiz> getQuizByCode(String code) {
        return quizRepository.findByCode(code)
                .filter(quiz -> quiz.getStatus() == Quiz.Status.ACTIVE);
    }

    public Quiz getQuizById(Integer quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public Quiz getQuizByIdWithQuestions(Integer quizId) {
        return quizRepository.findByIdWithQuestions(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public Question addQuestion(Integer quizId, Question question, Integer professorId) {
        Quiz quiz = getQuizById(quizId);
        
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to add questions to this quiz");
        }

        question.setQuizId(quizId);
        return questionRepository.save(question);
    }

    public Response addResponse(Integer questionId, Response response, Integer professorId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Quiz quiz = question.getQuiz();
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to add responses to this question");
        }

        response.setQuestionId(questionId);
        return responseRepository.save(response);
    }

    public Question updateQuestion(Integer questionId, Question updatedQuestion, Integer professorId) {
        Question existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Quiz quiz = existingQuestion.getQuiz();
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to update this question");
        }

        // Only update if the new question text is not null
        if (updatedQuestion.getQuestionText() != null && !updatedQuestion.getQuestionText().trim().isEmpty()) {
            existingQuestion.setQuestionText(updatedQuestion.getQuestionText());
        }
        return questionRepository.save(existingQuestion);
    }

    public void deleteQuestion(Integer questionId, Integer professorId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Quiz quiz = question.getQuiz();
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to delete this question");
        }

        questionRepository.delete(question);
    }

    public Response updateResponse(Integer responseId, Response updatedResponse, Integer professorId) {
        Response existingResponse = responseRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Response not found"));

        Question question = existingResponse.getQuestion();
        Quiz quiz = question.getQuiz();
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to update this response");
        }

        // Only update if the new response text is not null
        if (updatedResponse.getResponseText() != null && !updatedResponse.getResponseText().trim().isEmpty()) {
            existingResponse.setResponseText(updatedResponse.getResponseText());
        }
        // Update isCorrect flag (can be true or false)
        if (updatedResponse.getIsCorrect() != null) {
            existingResponse.setIsCorrect(updatedResponse.getIsCorrect());
        }
        return responseRepository.save(existingResponse);
    }

    public void deleteResponse(Integer responseId, Integer professorId) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Response not found"));

        Question question = response.getQuestion();
        Quiz quiz = question.getQuiz();
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to delete this response");
        }

        responseRepository.delete(response);
    }

    public Participation submitQuizAnswers(Integer quizId, List<Integer> selectedResponseIds,
                                           Integer userId, Integer guestId, Integer studentId,
                                           String studentResponses) {
        Quiz quiz = getQuizById(quizId);

        // Check if quiz is active
        if (quiz.getStatus() != Quiz.Status.ACTIVE) {
            throw new RuntimeException("Quiz is not available for participation. Current status: " + quiz.getStatus());
        }

        // Find existing participation (created when quiz started)
        Participation participation = findExistingParticipation(quizId, userId, guestId);
        if (participation == null) {
            throw new RuntimeException("No participation found. Student must start quiz before submitting answers.");
        }

        // Check if participation is marked as fraud
        if (Boolean.TRUE.equals(participation.getIsFraud())) {
            throw new RuntimeException("Cannot submit answers for a participation marked as fraud");
        }

        // Calculate score
        BigDecimal score = calculateScore(quizId, selectedResponseIds);

        // Update existing participation record
        participation.setScore(score);
        participation.setStudentResponses(studentResponses);

        return participationRepository.save(participation);
    }

    /**
     * Register participation when student joins quiz by code
     */
    public Participation registerParticipationByCode(String code, Integer userId, Integer guestId, Integer studentId) {
        Quiz quiz = quizRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        return createParticipation(quiz.getId(), userId, guestId, studentId);
    }

    /**
     * Register participation when student accesses quiz questions
     * This ensures fraud tracking begins immediately upon quiz access
     */
    public Participation registerParticipationForQuizAccess(Integer quizId, Integer userId, Integer guestId, Integer studentId) {
        Quiz quiz = getQuizById(quizId);
        
        // Check if quiz is active
        if (quiz.getStatus() != Quiz.Status.ACTIVE) {
            throw new RuntimeException("Quiz is not available for participation. Current status: " + quiz.getStatus());
        }

        return createParticipation(quizId, userId, guestId, studentId);
    }

    /**
     * Internal method to create participation with proper validation
     */
    private Participation createParticipation(Integer quizId, Integer userId, Integer guestId, Integer studentId) {
        // Only students can participate in quizzes
        Integer participationUserId = null;
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getRole() != User.Role.STUDENT) {
                throw new RuntimeException("Only students can participate in quizzes");
            }
            participationUserId = userId;
            if (participationRepository.existsByQuizIdAndUserId(quizId, participationUserId)) {
                throw new RuntimeException("User has already participated in this quiz");
            }
        }
        if (guestId != null && participationRepository.existsByQuizIdAndGuestId(quizId, guestId)) {
            throw new RuntimeException("Guest has already participated in this quiz");
        }

        Participation participation = new Participation();
        participation.setQuizId(quizId);
        participation.setUserId(participationUserId);
        participation.setGuestId(guestId);
        participation.setScore(java.math.BigDecimal.ZERO);
        participation.setIsFraud(false); // Ensure isFraud is explicitly set to false

        return participationRepository.save(participation);
    }

    public List<Participation> getQuizParticipations(Integer quizId, Integer professorId) {
        Quiz quiz = getQuizById(quizId);
        
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to view participations for this quiz");
        }

        // Use the custom query that eagerly fetches user and guest
        return participationRepository.findByQuizIdWithUserAndGuest(quizId);
    }

    public List<Participation> getUserParticipations(Integer userId) {
        return participationRepository.findByUserId(userId);
    }

    public Participation getParticipationById(Integer participationId) {
        return participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getPublicQuizzes() {
        return quizRepository.findAll(); // For now, all quizzes are considered public. In future, add isPublic field
    }

    public Participation startQuizParticipation(Integer quizId, Integer userId, Integer studentId) {
        // Check if quiz exists
        Quiz quiz = getQuizById(quizId);

        // Check if quiz is active
        if (quiz.getStatus() != Quiz.Status.ACTIVE) {
            throw new RuntimeException("Quiz is not available for participation. Current status: " + quiz.getStatus());
        }

        // Only students can participate in quizzes
        Integer participationUserId = null;
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getRole() != User.Role.STUDENT) {
                throw new RuntimeException("Only students can participate in quizzes");
            }
            participationUserId = userId;
            if (participationRepository.existsByQuizIdAndUserId(quizId, participationUserId)) {
                throw new RuntimeException("User has already participated in this quiz");
            }
        }

        // Create participation record with zero score initially
        Participation participation = new Participation();
        participation.setQuizId(quizId);
        participation.setUserId(participationUserId);
        participation.setGuestId(null);
        participation.setScore(java.math.BigDecimal.ZERO);
        participation.setIsFraud(false); // Ensure isFraud is explicitly set to false

        return participationRepository.save(participation);
    }

    /**
     * Mark a participation as fraud due to security violations
     * @param participationId The ID of the participation to mark as fraud
     * @param professorId The ID of the professor making the request (for authorization)
     * @return The updated participation
     */
    public Participation markParticipationAsFraud(Integer participationId, Integer professorId) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        Quiz quiz = participation.getQuiz();
        if (!quiz.getProfessorId().equals(professorId)) {
            throw new RuntimeException("Unauthorized to mark fraud for this quiz");
        }

        participation.setIsFraud(true);
        return participationRepository.save(participation);
    }

    /**
     * Find existing participation by quiz and user/guest
     * @param quizId The quiz ID
     * @param userId The user ID (optional)
     * @param guestId The guest ID (optional)
     * @return The existing participation or null if not found
     */
    private Participation findExistingParticipation(Integer quizId, Integer userId, Integer guestId) {
        if (userId != null) {
            return participationRepository.findByQuizIdAndUserId(quizId, userId).orElse(null);
        } else if (guestId != null) {
            return participationRepository.findByQuizIdAndGuestId(quizId, guestId).orElse(null);
        }
        return null;
    }

    private String generateUniqueQuizCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (quizRepository.existsByCode(code));
        return code;
    }

    private BigDecimal calculateScore(Integer quizId, List<Integer> selectedResponseIds) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        int totalQuestions = questions.size();
        int correctAnswers = 0;

        if (selectedResponseIds == null || selectedResponseIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<Response> allSelectedResponses = responseRepository.findAllById(selectedResponseIds);

        for (Question question : questions) {
            List<Response> correctResponses = responseRepository.findByQuestionIdAndIsCorrectTrue(question.getId());
            List<Response> selectedResponsesForQuestion = allSelectedResponses.stream()
                    .filter(r -> r.getQuestionId().equals(question.getId()))
                    .toList();

            // Check if all correct responses are selected and no incorrect ones are selected
            boolean allCorrectSelected = correctResponses.stream().allMatch(cr -> selectedResponsesForQuestion.stream().anyMatch(sr -> sr.getId().equals(cr.getId())));
            boolean noIncorrectSelected = selectedResponsesForQuestion.stream().allMatch(sr -> Boolean.TRUE.equals(sr.getIsCorrect()));

            boolean isCorrect = allCorrectSelected && noIncorrectSelected;

            if (isCorrect) {
                correctAnswers++;
            }
        }

        if (totalQuestions == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(correctAnswers)
                .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
