package com.jobflow.cooldown.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.cooldown.dto.ApplyAnywayRequest;
import com.jobflow.cooldown.dto.CompanyCooldownResponse;
import com.jobflow.cooldown.dto.CooldownTemplateResponse;
import com.jobflow.cooldown.dto.CooldownResponse;
import com.jobflow.cooldown.dto.CreateCompanyCooldownRequest;
import com.jobflow.cooldown.service.CooldownService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestParam(value = "role", required = false) String role,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Cooldown check request received for company: {}", company);

        Long userId = extractUserIdFromToken(authHeader);
        CooldownResponse response = cooldownService.checkCooldown(company, role, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CompanyCooldownResponse> createCompanyCooldown(
            @Valid @RequestBody CreateCompanyCooldownRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Create company cooldown request received for company: {}", request.getCompanyName());

        Long userId = extractUserIdFromToken(authHeader);
        CompanyCooldownResponse response = cooldownService.createCompanyCooldown(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<CompanyCooldownResponse>> createCompanyCooldowns(
            @RequestBody List<@Valid CreateCompanyCooldownRequest> requests,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Bulk create company cooldown request received with {} item(s)", requests.size());

        Long userId = extractUserIdFromToken(authHeader);
        List<CompanyCooldownResponse> response = cooldownService.createCompanyCooldowns(requests, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CompanyCooldownResponse>> getActiveCompanyCooldowns(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get active company cooldowns request received");

        Long userId = extractUserIdFromToken(authHeader);
        List<CompanyCooldownResponse> response = cooldownService.getActiveCompanyCooldowns(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/almost-eligible")
    public ResponseEntity<List<CompanyCooldownResponse>> getAlmostEligibleCooldowns(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get almost eligible company cooldowns request received");

        Long userId = extractUserIdFromToken(authHeader);
        List<CompanyCooldownResponse> response = cooldownService.getAlmostEligibleCooldowns(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CompanyCooldownResponse>> getCooldownHistory(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get cooldown history request received");

        Long userId = extractUserIdFromToken(authHeader);
        List<CompanyCooldownResponse> response = cooldownService.getCooldownHistory(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<CooldownTemplateResponse>> getTemplates() {
        return ResponseEntity.ok(cooldownService.getTemplates());
    }

    @PatchMapping("/{id}/apply-anyway")
    public ResponseEntity<CompanyCooldownResponse> recordApplyAnyway(
            @PathVariable Long id,
            @Valid @RequestBody ApplyAnywayRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Apply anyway note request received for cooldown id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        CompanyCooldownResponse response = cooldownService.recordApplyAnyway(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompanyCooldown(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Delete company cooldown request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        cooldownService.deleteCompanyCooldown(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
