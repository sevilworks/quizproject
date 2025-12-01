package com.quizbackend.repository;

import com.quizbackend.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Integer> {
    List<Participation> findByQuizId(Integer quizId);
    
    @Query("SELECT p FROM Participation p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.guest WHERE p.quizId = :quizId")
    List<Participation> findByQuizIdWithUserAndGuest(Integer quizId);
    
    List<Participation> findByUserId(Integer userId);
    List<Participation> findByGuestId(Integer guestId);
    Optional<Participation> findByQuizIdAndUserId(Integer quizId, Integer userId);
    Optional<Participation> findByQuizIdAndGuestId(Integer quizId, Integer guestId);
    boolean existsByQuizIdAndUserId(Integer quizId, Integer userId);
    boolean existsByQuizIdAndGuestId(Integer quizId, Integer guestId);

    // Aggregation queries for student statistics
    @Query("SELECT COUNT(p) FROM Participation p WHERE p.userId = ?1")
    long countByUserId(Integer userId);

    @Query("SELECT AVG(p.score) FROM Participation p WHERE p.userId = ?1")
    java.math.BigDecimal averageScoreByUserId(Integer userId);

    @Query("SELECT MAX(p.score) FROM Participation p WHERE p.userId = ?1")
    java.math.BigDecimal maxScoreByUserId(Integer userId);

    @Query("SELECT COUNT(p) FROM Participation p WHERE p.userId = ?1 AND p.score = 100")
    long countPerfectScoresByUserId(Integer userId);

    @Query("SELECT p FROM Participation p WHERE p.userId = ?1 ORDER BY p.createdAt DESC")
    List<Participation> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // For leaderboard and active students
    @Query("SELECT p.userId, COUNT(p), AVG(p.score) FROM Participation p GROUP BY p.userId ORDER BY AVG(p.score) DESC")
    List<Object[]> findLeaderboardByAverageScore();

    @Query("SELECT p.userId, COUNT(p), AVG(p.score) FROM Participation p GROUP BY p.userId ORDER BY COUNT(p) DESC")
    List<Object[]> findMostActiveByParticipationCount();
}
