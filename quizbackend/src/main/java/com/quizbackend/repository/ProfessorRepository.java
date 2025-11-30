package com.quizbackend.repository;

import com.quizbackend.entity.Professor;
import com.quizbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Integer> {
    List<Professor> findBySubscriptionId(Integer subscriptionId);
    
    @Query("SELECT p FROM Professor p WHERE p.user.email = ?1")
    Optional<Professor> findByEmail(String email);
}
