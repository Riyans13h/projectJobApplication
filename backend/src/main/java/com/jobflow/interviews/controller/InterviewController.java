package com.jobflow.interviews.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.interviews.dto.CreateInterviewRequest;
import com.jobflow.interviews.dto.InterviewResponse;
import com.jobflow.interviews.dto.UpdateInterviewRequest;
import com.jobflow.interviews.enums.InterviewResult;
import com.jobflow.interviews.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class InterviewController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "roundName",
            "interviewDate",
            "mode",
            "result",
            "createdAt"
    );

    private final InterviewService interviewService;
    private final JwtService jwtService;

    @PostMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<InterviewResponse> addInterviewRound(
            @PathVariable Long applicationId,
            @Valid @RequestBody CreateInterviewRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Add interview round request received for application: {}", applicationId);

        Long userId = extractUserIdFromToken(authHeader);
        InterviewResponse response = interviewService.addInterviewRound(applicationId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<Page<InterviewResponse>> getInterviewsForApplication(
            @PathVariable Long applicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "interviewDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get interviews request received for application: {}", applicationId);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<InterviewResponse> interviews = interviewService.getInterviewsForApplication(applicationId, userId, pageable);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> getInterviewById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get interview by id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        InterviewResponse response = interviewService.getInterviewById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterviewRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Update interview request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        InterviewResponse response = interviewService.updateInterview(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/interviews/{id}/result")
    public ResponseEntity<InterviewResponse> updateInterviewResult(
            @PathVariable Long id,
            @RequestParam InterviewResult result,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Update interview result request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        InterviewResponse response = interviewService.updateInterviewResult(id, result, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> deleteInterview(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Delete interview request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        interviewService.deleteInterview(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be zero or greater");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Unsupported sort field: " + sortBy);
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
