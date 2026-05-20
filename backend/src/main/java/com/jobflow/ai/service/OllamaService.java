package com.jobflow.ai.service;

import com.jobflow.ai.dto.OllamaGenerateRequest;
import com.jobflow.ai.dto.OllamaGenerateResponse;
import com.jobflow.ai.exception.AIExtractionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaService {

    private final WebClient ollamaWebClient;

    @Value("${ollama.model}")
    private String model;

    @Value("${ollama.timeout-seconds}")
    private Long timeoutSeconds;

    public String generateJson(String prompt) {
        OllamaGenerateRequest request = OllamaGenerateRequest.builder()
                .model(model)
                .prompt(prompt)
                .stream(false)
                .format("json")
                .options(Map.of(
                        "temperature", 0,
                        "top_p", 0.1
                ))
                .build();

        try {
            OllamaGenerateResponse response = ollamaWebClient.post()
                    .uri("/api/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OllamaGenerateResponse.class)
                    .block(Duration.ofSeconds(timeoutSeconds));

            if (response == null || response.getResponse() == null || response.getResponse().isBlank()) {
                throw new AIExtractionException("Ollama returned an empty response");
            }

            return response.getResponse();
        } catch (WebClientResponseException e) {
            log.error("Ollama API error: {}", e.getResponseBodyAsString(), e);
            throw new AIExtractionException("Ollama API request failed with status " + e.getStatusCode(), e);
        } catch (AIExtractionException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to call Ollama API: {}", e.getMessage(), e);
            throw new AIExtractionException("Failed to call Ollama API", e);
        }
    }
}
