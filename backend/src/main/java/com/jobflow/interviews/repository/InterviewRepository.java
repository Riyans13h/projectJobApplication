package com.jobflow.interviews.repository;

import com.jobflow.interviews.entity.Interview;
import com.jobflow.interviews.enums.InterviewResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    Page<Interview> findByApplication_IdAndApplication_UserId(Long applicationId, Long userId, Pageable pageable);

    Optional<Interview> findByIdAndApplication_UserId(Long id, Long userId);

    void deleteByApplication_Id(Long applicationId);

    @Query("SELECT i FROM Interview i WHERE i.application.userId = :userId " +
            "AND i.interviewDate >= :now " +
            "AND i.result = :result")
    List<Interview> findUpcomingInterviews(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now,
            @Param("result") InterviewResult result,
            Pageable pageable
    );
}
