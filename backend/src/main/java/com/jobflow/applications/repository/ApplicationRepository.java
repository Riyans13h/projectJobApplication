package com.jobflow.applications.repository;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /**
     * Find all applications for a user with pagination
     */
    Page<Application> findByUserId(Long userId, Pageable pageable);

    /**
     * Find application by id and user id
     */
    Optional<Application> findByIdAndUserId(Long id, Long userId);

    /**
     * Find applications by status for a user
     */
    Page<Application> findByUserIdAndStatus(Long userId, ApplicationStatus status, Pageable pageable);

    /**
     * Find applications by company name for a user
     */
    Page<Application> findByUserIdAndCompanyNameContainingIgnoreCase(Long userId, String companyName, Pageable pageable);

    /**
     * Find latest application for cooldown checks
     */
    Optional<Application> findFirstByUserIdAndCompanyNameIgnoreCaseOrderByApplicationDateDescCreatedAtDesc(
            Long userId,
            String companyName
    );

    /**
     * Find applications by priority for a user
     */
    Page<Application> findByUserIdAndPriority(Long userId, Priority priority, Pageable pageable);

    /**
     * Find applications by status and priority for a user
     */
    Page<Application> findByUserIdAndStatusAndPriority(Long userId, ApplicationStatus status, Priority priority, Pageable pageable);

    /**
     * Count applications by status for a user
     */
    Long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    /**
     * Count applications by a group of statuses for a user
     */
    Long countByUserIdAndStatusIn(Long userId, List<ApplicationStatus> statuses);

    /**
     * Count all applications for a user
     */
    Long countByUserId(Long userId);

    boolean existsByUserIdAndJobIdStartingWith(Long userId, String jobIdPrefix);

    /**
     * Find applications with cooldown period configured for a user
     */
    List<Application> findByUserIdAndCooldownPeriodGreaterThan(Long userId, Integer cooldownPeriod);

    /**
     * Advanced filtering with multiple criteria
     */
    @Query("SELECT a FROM Application a WHERE a.userId = :userId " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:company IS NULL OR LOWER(a.companyName) LIKE LOWER(CONCAT('%', :company, '%'))) " +
            "AND (:priority IS NULL OR a.priority = :priority)")
    Page<Application> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("status") ApplicationStatus status,
            @Param("company") String company,
            @Param("priority") Priority priority,
            Pageable pageable
    );
}
