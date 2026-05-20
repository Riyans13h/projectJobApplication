package com.jobflow.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobflow.ai.dto.*;
import com.jobflow.ai.exception.AIExtractionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIExtractionService {

    private final OllamaService ollamaService;
    private final ObjectMapper objectMapper;

    public AIResponse<?> extract(AIRequest request) {
        String prompt = buildPrompt(request.getType(), request.getText().trim());
        String aiResponse = ollamaService.generateJson(prompt);

        return switch (request.getType()) {
            case RESUME -> AIResponse.<ResumeExtraction>builder()
                    .type(ExtractionType.RESUME)
                    .data(parseResponse(aiResponse, ResumeExtraction.class))
                    .success(true)
                    .message("Resume extraction completed")
                    .build();
            case JD -> AIResponse.<JDExtraction>builder()
                    .type(ExtractionType.JD)
                    .data(parseResponse(aiResponse, JDExtraction.class))
                    .success(true)
                    .message("JD extraction completed")
                    .build();
        };
    }

    private <T> T parseResponse(String aiResponse, Class<T> responseType) {
        try {
            String json = extractJsonObject(aiResponse);
            JsonNode root = objectMapper.readTree(json);
            validateJsonObject(root);
            return objectMapper.treeToValue(root, responseType);
        } catch (JsonProcessingException e) {
            log.error("Invalid AI JSON response: {}", aiResponse, e);
            throw new AIExtractionException("AI returned invalid JSON", e);
        } catch (IllegalArgumentException e) {
            log.error("AI response parsing failed: {}", e.getMessage());
            throw new AIExtractionException(e.getMessage(), e);
        }
    }

    private String extractJsonObject(String aiResponse) {
        String trimmed = aiResponse == null ? "" : aiResponse.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');

        if (start < 0 || end < start) {
            throw new IllegalArgumentException("AI response did not contain a JSON object");
        }

        return trimmed.substring(start, end + 1);
    }

    private void validateJsonObject(JsonNode root) {
        if (root == null || !root.isObject()) {
            throw new IllegalArgumentException("AI response must be a JSON object");
        }
    }

    private String buildPrompt(ExtractionType type, String text) {
        return switch (type) {
            case RESUME -> buildResumePrompt(text);
            case JD -> buildJdPrompt(text);
        };
    }

    private String buildResumePrompt(String text) {
        return """
                You are an information extraction system. Extract structured resume data.
                Return ONLY a valid JSON object. Do not include markdown, explanations, or extra keys.
                Use null for unknown scalar values and [] for unknown arrays.

                Required JSON schema:
                {
                  "firstName": string|null,
                  "lastName": string|null,
                  "email": string|null,
                  "phone": string|null,
                  "skills": string[],
                  "currentCompany": string|null,
                  "currentRole": string|null,
                  "education": string|null
                }

                Resume text:
                %s
                """.formatted(text);
    }

    private String buildJdPrompt(String text) {
        return """
                You are an information extraction system. Extract structured job description data.
                Return ONLY a valid JSON object. Do not include markdown, explanations, or extra keys.
                Use null for unknown scalar values and [] for unknown arrays.
                workMode must be one of REMOTE, ONSITE, HYBRID, or null.
                employmentType must be one of FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, or null.

                Required JSON schema:
                {
                  "companyName": string|null,
                  "role": string|null,
                  "jobId": string|null,
                  "location": string|null,
                  "workMode": "REMOTE"|"ONSITE"|"HYBRID"|null,
                  "employmentType": "FULL_TIME"|"PART_TIME"|"CONTRACT"|"INTERNSHIP"|"FREELANCE"|null,
                  "skillsRequired": string[]
                }

                Job description text:
                %s
                """.formatted(text);
    }
}
