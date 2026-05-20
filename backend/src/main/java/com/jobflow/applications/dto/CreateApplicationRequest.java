package com.jobflow.applications.dto;

import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.EmploymentType;
import com.jobflow.applications.enums.Priority;
import com.jobflow.applications.enums.WorkMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApplicationRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Role is required")
    private String role;

    private String jobId;

    private String location;

    private WorkMode workMode;

    private EmploymentType employmentType;

    @NotNull(message = "Application status is required")
    private ApplicationStatus status;

    private Priority priority;

    @NotNull(message = "Application date is required")
    private LocalDate applicationDate;

    private String appliedThrough;

    private String emailUsed;

    private String phoneUsed;

    private String notes;

    private Integer cooldownPeriod;
}
