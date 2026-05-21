package com.jobflow.cooldown.repository;

import com.jobflow.cooldown.entity.CompanyCooldown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyCooldownRepository extends JpaRepository<CompanyCooldown, Long> {

    List<CompanyCooldown> findByUserIdOrderByEligibleReapplyDateAsc(Long userId);

    List<CompanyCooldown> findByUserIdAndEligibleReapplyDateAfterOrderByEligibleReapplyDateAsc(Long userId, LocalDate date);

    List<CompanyCooldown> findByUserIdAndEligibleReapplyDateLessThanEqualOrderByEligibleReapplyDateDesc(Long userId, LocalDate date);

    List<CompanyCooldown> findByUserIdAndEligibleReapplyDateBetweenOrderByEligibleReapplyDateAsc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<CompanyCooldown> findByIdAndUserId(Long id, Long userId);

    Optional<CompanyCooldown> findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIgnoreCaseOrderByEligibleReapplyDateDesc(
            Long userId,
            String companyName,
            String role
    );

    Optional<CompanyCooldown> findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleIsNullOrderByEligibleReapplyDateDesc(
            Long userId,
            String companyName
    );

    Optional<CompanyCooldown> findFirstByUserIdAndCompanyNameIgnoreCaseAndRoleOrderByEligibleReapplyDateDesc(
            Long userId,
            String companyName,
            String role
    );
}
