package com.jobflow.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRequest {

    @NotNull(message = "Extraction type is required")
    private ExtractionType type;

    @NotBlank(message = "Text is required")
    @Size(max = 50000, message = "Text must not exceed 50000 characters")
    private String text;
}
