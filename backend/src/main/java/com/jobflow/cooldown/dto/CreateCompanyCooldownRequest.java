package com.jobflow.cooldown.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateCompanyCooldownRequest {

    @NotBlank(message = "Company is required")
    private String companyName;

    private String role;

    @NotNull(message = "Last applied date is required")
    private LocalDate lastAppliedDate;

    @NotNull(message = "Cooldown period is required")
    @Min(value = 1, message = "Cooldown period must be at least 1 day")
    @Max(value = 365, message = "Cooldown period must be 365 days or less")
    private Integer cooldownPeriod;

    private Boolean updateExisting;
}
