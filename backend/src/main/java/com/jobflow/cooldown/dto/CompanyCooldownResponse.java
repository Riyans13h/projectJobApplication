package com.jobflow.cooldown.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CompanyCooldownResponse {

    private Long id;
    private String companyName;
    private String role;
    private LocalDate lastAppliedDate;
    private Integer cooldownPeriod;
    private LocalDate eligibleReapplyDate;
    private boolean cooldownActive;
    private long daysRemaining;
    private String severity;
    private LocalDate suggestedReapplyDate;
    private String message;
    private String applyAnywayNote;
    private LocalDateTime appliedAnywayAt;
    private String source;
    private LocalDateTime createdAt;
}
