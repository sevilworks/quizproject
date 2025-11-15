package com.quizbackend.repository;

import com.quizbackend.entity.Student;
import com.quizbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    Optional<Student> findByUser(User user);

    Optional<Student> findByUserId(Integer userId);

    @Query("SELECT s FROM Student s WHERE s.user.email = ?1")
    Optional<Student> findByEmail(String email);

    @Query("SELECT s FROM Student s ORDER BY s.createdAt DESC")
    List<Student> findAllOrderByCreatedAtDesc();
}
