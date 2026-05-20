package com.jobflow.timeline.repository;

import com.jobflow.timeline.entity.Timeline;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TimelineRepository extends JpaRepository<Timeline, Long> {

    Page<Timeline> findByApplication_IdAndApplication_UserId(Long applicationId, Long userId, Pageable pageable);

    Page<Timeline> findByApplication_UserId(Long userId, Pageable pageable);

    Optional<Timeline> findByIdAndApplication_UserId(Long id, Long userId);

    void deleteByApplication_Id(Long applicationId);
}
