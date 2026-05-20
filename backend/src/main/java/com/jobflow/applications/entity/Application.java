package com.jobflow.applications.entity;

import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.EmploymentType;
import com.jobflow.applications.enums.Priority;
import com.jobflow.applications.enums.WorkMode;
import com.jobflow.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_company_name", columnList = "company_name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private User user;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String role;

    @Column
    private String jobId;

    @Column
    private String location;

    @Enumerated(EnumType.STRING)
    @Column
    private WorkMode workMode;

    @Enumerated(EnumType.STRING)
    @Column
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(nullable = false)
    private LocalDate applicationDate;

    @Column
    private String appliedThrough;

    @Column
    private String emailUsed;

    @Column
    private String phoneUsed;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private Integer cooldownPeriod;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
