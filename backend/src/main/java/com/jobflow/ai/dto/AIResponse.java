package com.jobflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIResponse<T> {

    private ExtractionType type;

    private T data;

    private boolean success;

    private String message;
}
