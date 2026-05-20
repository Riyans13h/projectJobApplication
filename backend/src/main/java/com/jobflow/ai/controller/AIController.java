package com.jobflow.ai.controller;

import com.jobflow.ai.dto.AIRequest;
import com.jobflow.ai.dto.AIResponse;
import com.jobflow.ai.service.AIExtractionService;
import com.jobflow.auth.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class AIController {

    private final AIExtractionService aiExtractionService;
    private final JwtService jwtService;

    @PostMapping("/extract")
    public ResponseEntity<AIResponse<?>> extract(
            @Valid @RequestBody AIRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("AI extraction request received for type: {}", request.getType());

        extractUserIdFromToken(authHeader);
        AIResponse<?> response = aiExtractionService.extract(request);
        return ResponseEntity.ok(response);
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
