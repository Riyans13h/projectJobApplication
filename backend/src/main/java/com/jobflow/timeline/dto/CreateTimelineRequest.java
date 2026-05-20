package com.jobflow.timeline.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTimelineRequest {

    @NotBlank(message = "Event is required")
    @Size(max = 150, message = "Event must not exceed 150 characters")
    private String event;

    private String notes;

    private LocalDateTime eventDate;
}
