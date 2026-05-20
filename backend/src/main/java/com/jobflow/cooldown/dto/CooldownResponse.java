package com.jobflow.cooldown.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CooldownResponse {

    private String companyName;

    private LocalDate lastAppliedDate;

    private Integer cooldownPeriod;

    private LocalDate eligibleReapplyDate;

    private boolean cooldownActive;

    private long daysRemaining;

    private String message;
}
