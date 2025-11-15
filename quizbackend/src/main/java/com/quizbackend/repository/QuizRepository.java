package com.quizbackend.repository;

import com.quizbackend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    List<Quiz> findByProfessorId(Integer professorId);
    Optional<Quiz> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions qs LEFT JOIN FETCH qs.responses WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestions(@Param("id") Integer id);
}
