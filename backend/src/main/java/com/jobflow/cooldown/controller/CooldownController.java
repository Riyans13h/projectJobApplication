package com.jobflow.cooldown.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.cooldown.dto.CooldownResponse;
import com.jobflow.cooldown.service.CooldownService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cooldown")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class CooldownController {

    private final CooldownService cooldownService;
    private final JwtService jwtService;

    @GetMapping("/check")
    public ResponseEntity<CooldownResponse> checkCooldown(
            @RequestParam("company") @NotBlank(message = "Company is required") String company,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Cooldown check request received for company: {}", company);

        Long userId = extractUserIdFromToken(authHeader);
        CooldownResponse response = cooldownService.checkCooldown(company, userId);
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
