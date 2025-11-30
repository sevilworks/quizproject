package com.quizbackend.repository;

import com.quizbackend.entity.ProfessorSubscription;
import com.quizbackend.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfessorSubscriptionRepository extends JpaRepository<ProfessorSubscription, Integer> {
    
    List<ProfessorSubscription> findByProfessorId(Integer professorId);
    
    List<ProfessorSubscription> findByIsActiveTrue();
    
    List<ProfessorSubscription> findByIsActiveFalse();
    
    @Query("SELECT ps FROM ProfessorSubscription ps ORDER BY ps.createdAt DESC")
    List<ProfessorSubscription> findAllOrderByCreatedAtDesc();
}