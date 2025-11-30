package com.quizbackend.service;

import com.quizbackend.entity.Admin;
import com.quizbackend.entity.User;
import com.quizbackend.entity.Reclamation;
import com.quizbackend.entity.Quiz;
import com.quizbackend.entity.Professor;
import com.quizbackend.entity.Student;
import com.quizbackend.entity.Guest;
import com.quizbackend.entity.Subscription;
import com.quizbackend.repository.AdminRepository;
import com.quizbackend.repository.UserRepository;
import com.quizbackend.repository.ReclamationRepository;
import com.quizbackend.repository.QuizRepository;
import com.quizbackend.repository.ProfessorRepository;
import com.quizbackend.repository.StudentRepository;
import com.quizbackend.repository.GuestRepository;
import com.quizbackend.repository.SubscriptionRepository;
import com.quizbackend.repository.ParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    public Admin createAdmin(User user, String firstName, String lastName) {
        Admin admin = new Admin();
        admin.setUserId(user.getId());
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        
        return adminRepository.save(admin);
    }

    public Admin getAdminById(Integer id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    public Admin updateAdmin(Integer id, String firstName, String lastName) {
        Admin admin = getAdminById(id);
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        return adminRepository.save(admin);
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    // Reclamation Management
    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findAllOrderByCreatedAtDesc();
    }
    
    public List<Reclamation> getReclamationsByStatus(Reclamation.Status status) {
        return reclamationRepository.findByStatus(status);
    }

    public Reclamation getReclamationById(Integer id) {
        return reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found"));
    }

    public void updateReclamationStatus(Integer id, String status) {
        Reclamation reclamation = getReclamationById(id);
        reclamation.setStatus(Reclamation.Status.valueOf(status.toUpperCase()));
        reclamationRepository.save(reclamation);
    }

    public void sendReclamationResponse(Integer id, String responseText) {
        Reclamation reclamation = getReclamationById(id);
        reclamation.setResponseText(responseText);
        reclamation.setStatus(Reclamation.Status.RESOLVED);
        reclamationRepository.save(reclamation);
    }

    public void deleteReclamation(Integer id) {
        Reclamation reclamation = getReclamationById(id);
        reclamationRepository.delete(reclamation);
    }

    // Dashboard Statistics
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count statistics
        long totalUsers = userRepository.count();
        long totalProfessors = professorRepository.count();
        long totalStudents = studentRepository.count();
        long totalGuests = guestRepository.count();
        long totalQuizzes = quizRepository.count();
        long totalSubscriptions = subscriptionRepository.count();
        long totalParticipations = participationRepository.count();
        long pendingReclamations = reclamationRepository.findByStatus(Reclamation.Status.PENDING).size();
        
        // Structure data as expected by frontend
        Map<String, Object> users = new HashMap<>();
        users.put("total", totalUsers);
        users.put("professors", totalProfessors);
        users.put("students", totalStudents);
        users.put("guests", totalGuests);
        
        Map<String, Object> quizzes = new HashMap<>();
        quizzes.put("total", totalQuizzes);
        quizzes.put("active", totalQuizzes); // Assuming all quizzes are active for now
        
        Map<String, Object> subscriptions = new HashMap<>();
        subscriptions.put("total", totalSubscriptions);
        
        stats.put("users", users);
        stats.put("quizzes", quizzes);
        stats.put("subscriptions", subscriptions);
        stats.put("totalParticipations", totalParticipations);
        stats.put("pendingReclamations", pendingReclamations);
        
        return stats;
    }

    // Dashboard Report
    public Map<String, Object> getDashboardReport() {
        Map<String, Object> report = new HashMap<>();
        
        // Get recent data
        List<Quiz> recentQuizzes = quizRepository.findAll().stream()
                .sorted((q1, q2) -> q2.getCreatedAt().compareTo(q1.getCreatedAt()))
                .limit(10)
                .toList();
        
        List<Student> recentStudents = studentRepository.findAllOrderByCreatedAtDesc().stream()
                .limit(10)
                .toList();
        
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        
        report.put("recentQuizzes", recentQuizzes);
        report.put("recentStudents", recentStudents);
        report.put("subscriptions", allSubscriptions);
        
        return report;
    }

    // Get all subscription plans
    public List<Subscription> getAllSubscriptionPlans() {
        return subscriptionRepository.findAll();
    }
}
