package com.quizbackend.repository;

import com.quizbackend.entity.Reclamation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Integer> {
    
    List<Reclamation> findByUserId(Integer userId);
    
    List<Reclamation> findByStatus(Reclamation.Status status);
    
    List<Reclamation> findByPriority(Reclamation.Priority priority);
    
    @Query("SELECT r FROM Reclamation r ORDER BY r.createdAt DESC")
    List<Reclamation> findAllOrderByCreatedAtDesc();
}
