package com.jobflow.dashboard.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.dashboard.dto.DashboardStats;
import com.jobflow.dashboard.dto.Reminder;
import com.jobflow.dashboard.service.DashboardService;
import com.jobflow.timeline.dto.TimelineResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class DashboardController {

    private final DashboardService dashboardService;
    private final JwtService jwtService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Dashboard stats request received");

        Long userId = extractUserIdFromToken(authHeader);
        DashboardStats stats = dashboardService.getDashboardStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activity")
    public ResponseEntity<Page<TimelineResponse>> getRecentApplicationActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Dashboard activity request received");

        Long userId = extractUserIdFromToken(authHeader);
        Pageable pageable = createPageable(page, size);
        Page<TimelineResponse> activity = dashboardService.getRecentApplicationActivity(userId, pageable);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/reminders")
    public ResponseEntity<List<Reminder>> getPendingReminders(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Dashboard reminders request received");

        Long userId = extractUserIdFromToken(authHeader);
        List<Reminder> reminders = dashboardService.getPendingReminders(userId);
        return ResponseEntity.ok(reminders);
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
