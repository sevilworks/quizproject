package com.quizbackend.service;

import com.quizbackend.entity.Professor;
import com.quizbackend.entity.Subscription;
import com.quizbackend.entity.User;
import com.quizbackend.repository.ProfessorRepository;
import com.quizbackend.repository.SubscriptionRepository;
import com.quizbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    public Professor createProfessor(User user, String firstName, String lastName) {
        Professor professor = new Professor();
        professor.setUserId(user.getId());
        professor.setFirstName(firstName);
        professor.setLastName(lastName);
        
        return professorRepository.save(professor);
    }

    public Professor getProfessorById(Integer id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
    }

    public Professor updateProfessor(Integer id, String firstName, String lastName) {
        Professor professor = getProfessorById(id);
        professor.setFirstName(firstName);
        professor.setLastName(lastName);
        return professorRepository.save(professor);
    }

    public void assignSubscription(Integer professorId, Integer subscriptionId) {
        Professor professor = getProfessorById(professorId);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        professor.setSubscriptionId(subscriptionId);
        professor.setSubscriptionStartDate(LocalDate.now());
        professor.setSubscriptionEndDate(LocalDate.now().plusDays(subscription.getDurationDays()));

        professorRepository.save(professor);
    }

    public boolean isSubscriptionActive(Integer professorId) {
        Professor professor = getProfessorById(professorId);
        if (professor.getSubscriptionEndDate() == null) {
            return false;
        }
        return professor.getSubscriptionEndDate().isAfter(LocalDate.now()) || 
               professor.getSubscriptionEndDate().isEqual(LocalDate.now());
    }

    public List<Professor> getAllProfessors() {
        return professorRepository.findAll();
    }

    public List<Professor> getProfessorsBySubscription(Integer subscriptionId) {
        return professorRepository.findBySubscriptionId(subscriptionId);
    }
    public Professor getProfessorByUsername(String username) {
        // Find user first, then find professor by user ID
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return professorRepository.findById(user.getId())
            .orElseThrow(() -> new RuntimeException("Professor not found"));
    }
}
