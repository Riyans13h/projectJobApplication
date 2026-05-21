package com.jobflow.cooldown.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyAnywayRequest {

    @NotBlank(message = "Reason is required")
    private String note;
}
