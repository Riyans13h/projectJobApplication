package com.jobflow.timeline.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.timeline.dto.CreateTimelineRequest;
import com.jobflow.timeline.dto.TimelineResponse;
import com.jobflow.timeline.service.TimelineService;
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

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class TimelineController {

    private final TimelineService timelineService;
    private final JwtService jwtService;

    @PostMapping("/applications/{applicationId}/timeline")
    public ResponseEntity<TimelineResponse> addTimelineEntry(
            @PathVariable Long applicationId,
            @Valid @RequestBody CreateTimelineRequest request,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Add timeline entry request received for application: {}", applicationId);

        Long userId = extractUserIdFromToken(authHeader);
        TimelineResponse response = timelineService.addTimelineEntry(applicationId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications/{applicationId}/timeline")
    public ResponseEntity<Page<TimelineResponse>> getTimelineForApplication(
            @PathVariable Long applicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get timeline request received for application: {}", applicationId);

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size);
        Page<TimelineResponse> timeline = timelineService.getTimelineForApplication(applicationId, userId, pageable);
        return ResponseEntity.ok(timeline);
    }

    @DeleteMapping("/timeline/{id}")
    public ResponseEntity<Void> deleteTimelineEntry(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Delete timeline entry request received for id: {}", id);

        Long userId = extractUserIdFromToken(authHeader);
        timelineService.deleteTimelineEntry(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Pageable createPageable(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be zero or greater");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }

        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "eventDate"));
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
