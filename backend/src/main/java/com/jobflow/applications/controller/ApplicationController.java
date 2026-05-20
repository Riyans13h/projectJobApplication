package com.jobflow.applications.controller;

import com.jobflow.applications.dto.ApplicationResponse;
import com.jobflow.applications.dto.ApplicationStatsResponse;
import com.jobflow.applications.dto.CreateApplicationRequest;
import com.jobflow.applications.dto.UpdateApplicationRequest;
import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.Priority;
import com.jobflow.applications.service.ApplicationService;
import com.jobflow.auth.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JwtService jwtService;

    /**
     * Create new application
     * POST /api/applications
     */
    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @Valid @RequestBody CreateApplicationRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Create application request received");

        Long userId = extractUserIdFromToken(authHeader);
        ApplicationResponse response = applicationService.createApplication(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all applications with pagination
     * GET /api/applications?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Page<ApplicationResponse>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get all applications request received");

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> applications = applicationService.getAllApplications(userId, pageable);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get application by id
     * GET /api/applications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get application by id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        ApplicationResponse response = applicationService.getApplicationById(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update application
     * PUT /api/applications/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Update application request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        ApplicationResponse response = applicationService.updateApplication(id, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update application status
     * PATCH /api/applications/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Update application status request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        ApplicationResponse response = applicationService.updateApplicationStatus(id, status, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete application
     * DELETE /api/applications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Delete application request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        applicationService.deleteApplication(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get applications by status
     * GET /api/applications/filter/status?status=APPLIED&page=0&size=10
     */
    @GetMapping("/filter/status")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsByStatus(
            @RequestParam ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get applications by status: {}", status);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> applications = applicationService.getApplicationsByStatus(userId, status, pageable);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get applications by company name
     * GET /api/applications/filter/company?company=Google&page=0&size=10
     */
    @GetMapping("/filter/company")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsByCompany(
            @RequestParam String company,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get applications by company: {}", company);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> applications = applicationService.getApplicationsByCompany(userId, company, pageable);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get applications by priority
     * GET /api/applications/filter/priority?priority=HIGH&page=0&size=10
     */
    @GetMapping("/filter/priority")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsByPriority(
            @RequestParam Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get applications by priority: {}", priority);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> applications = applicationService.getApplicationsByPriority(userId, priority, pageable);
        return ResponseEntity.ok(applications);
    }

    /**
     * Advanced filtering with multiple criteria
     * GET /api/applications/filter?status=APPLIED&company=Google&priority=HIGH&page=0&size=10
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsWithFilters(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get applications with filters");

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> applications = applicationService.getApplicationsWithFilters(
                userId, status, company, priority, pageable);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get application statistics for dashboard
     * GET /api/applications/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApplicationStatsResponse> getApplicationStats(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get application stats request received");

        Long userId = extractUserIdFromToken(authHeader);
        ApplicationStatsResponse stats = applicationService.getApplicationStats(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Extract user ID from JWT token in Authorization header
     */
    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
