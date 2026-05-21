package com.jobflow.cooldown.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_cooldowns", indexes = {
        @Index(name = "idx_company_cooldowns_user_id", columnList = "user_id"),
        @Index(name = "idx_company_cooldowns_company", columnList = "company_name"),
        @Index(name = "idx_company_cooldowns_eligible_date", columnList = "eligible_reapply_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyCooldown {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(length = 150)
    private String role;

    @Column(name = "last_applied_date", nullable = false)
    private LocalDate lastAppliedDate;

    @Column(name = "cooldown_period", nullable = false)
    private Integer cooldownPeriod;

    @Column(name = "eligible_reapply_date", nullable = false)
    private LocalDate eligibleReapplyDate;

    @Column(name = "apply_anyway_note", columnDefinition = "TEXT")
    private String applyAnywayNote;

    @Column(name = "applied_anyway_at")
    private LocalDateTime appliedAnywayAt;

    @Column(length = 50)
    private String source;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
