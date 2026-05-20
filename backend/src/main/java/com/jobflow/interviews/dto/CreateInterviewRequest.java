package com.jobflow.interviews.dto;

import com.jobflow.interviews.enums.InterviewMode;
import com.jobflow.interviews.enums.InterviewResult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateInterviewRequest {

    @NotBlank(message = "Round name is required")
    @Size(max = 150, message = "Round name must not exceed 150 characters")
    private String roundName;

    @NotNull(message = "Interview date is required")
    private LocalDateTime interviewDate;

    @NotNull(message = "Interview mode is required")
    private InterviewMode mode;

    private InterviewResult result;

    private String notes;
}
