package com.quizbackend.repository;

import com.quizbackend.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Integer> {
    List<Response> findByQuestionId(Integer questionId);
    List<Response> findByQuestionIdAndIsCorrectTrue(Integer questionId);
    List<Response> findAllById(Iterable<Integer> ids);
}
