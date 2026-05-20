package com.jobflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OllamaGenerateRequest {

    private String model;

    private String prompt;

    private boolean stream;

    private String format;

    private Map<String, Object> options;
}
