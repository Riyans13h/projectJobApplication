package com.jobflow.applications.dto;

import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.EmploymentType;
import com.jobflow.applications.enums.Priority;
import com.jobflow.applications.enums.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {

    private Long id;

    private Long userId;

    private String companyName;

    private String role;

    private String jobId;

    private String location;

    private WorkMode workMode;

    private EmploymentType employmentType;

    private ApplicationStatus status;

    private Priority priority;

    private LocalDate applicationDate;

    private String appliedThrough;

    private String emailUsed;

    private String phoneUsed;

    private String notes;

    private Integer cooldownPeriod;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
