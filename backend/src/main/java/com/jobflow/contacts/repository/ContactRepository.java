package com.jobflow.contacts.repository;

import com.jobflow.contacts.entity.Contact;
import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    /**
     * Find all contacts for a user with pagination
     */
    Page<Contact> findByUser_Id(Long userId, Pageable pageable);

    /**
     * Find contact by id and user id
     */
    Optional<Contact> findByIdAndUser_Id(Long id, Long userId);

    /**
     * Find contacts by company for a user
     */
    Page<Contact> findByUser_IdAndCompanyContainingIgnoreCase(Long userId, String company, Pageable pageable);

    /**
     * Find contacts by contact type for a user
     */
    Page<Contact> findByUser_IdAndContactType(Long userId, ContactType contactType, Pageable pageable);

    /**
     * Find contacts by status for a user
     */
    Page<Contact> findByUser_IdAndStatus(Long userId, ContactStatus status, Pageable pageable);

    /**
     * Find contacts by help score for a user
     */
    Page<Contact> findByUser_IdAndHelpScore(Long userId, HelpScore helpScore, Pageable pageable);

    /**
     * Count contacts by type for a user
     */
    Long countByUser_IdAndContactType(Long userId, ContactType contactType);

    /**
     * Count contacts by status for a user
     */
    Long countByUser_IdAndStatus(Long userId, ContactStatus status);

    /**
     * Count total contacts for a user
     */
    Long countByUser_Id(Long userId);

    /**
     * Check if contact exists by email for a user
     */
    boolean existsByUser_IdAndEmailIgnoreCase(Long userId, String email);

    @Query("SELECT COUNT(c) FROM Contact c WHERE c.user.id = :userId " +
            "AND (c.status = com.jobflow.contacts.enums.ContactStatus.FOLLOW_UP_NEEDED " +
            "OR (c.nextFollowupDate IS NOT NULL AND c.nextFollowupDate <= :today))")
    Long countPendingFollowups(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId " +
            "AND (c.status = com.jobflow.contacts.enums.ContactStatus.FOLLOW_UP_NEEDED " +
            "OR (c.nextFollowupDate IS NOT NULL AND c.nextFollowupDate <= :today))")
    List<Contact> findPendingFollowups(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            Pageable pageable
    );

    /**
     * Advanced filtering with multiple criteria
     */
    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId " +
            "AND (:company IS NULL OR LOWER(c.company) LIKE LOWER(CONCAT('%', :company, '%'))) " +
            "AND (:contactType IS NULL OR c.contactType = :contactType) " +
            "AND (:status IS NULL OR c.status = :status) " +
            "AND (:helpScore IS NULL OR c.helpScore = :helpScore)")
    Page<Contact> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("company") String company,
            @Param("contactType") ContactType contactType,
            @Param("status") ContactStatus status,
            @Param("helpScore") HelpScore helpScore,
            Pageable pageable
    );

}
