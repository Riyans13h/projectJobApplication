package com.jobflow.timeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineResponse {

    private Long id;

    private Long applicationId;

    private Long userId;

    private String event;

    private String notes;

    private LocalDateTime eventDate;

    private LocalDateTime createdAt;
}
