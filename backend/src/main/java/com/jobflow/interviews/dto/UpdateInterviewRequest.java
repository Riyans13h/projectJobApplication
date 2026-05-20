package com.jobflow.interviews.dto;

import com.jobflow.interviews.enums.InterviewMode;
import com.jobflow.interviews.enums.InterviewResult;
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
public class UpdateInterviewRequest {

    @Size(max = 150, message = "Round name must not exceed 150 characters")
    private String roundName;

    private LocalDateTime interviewDate;

    private InterviewMode mode;

    private InterviewResult result;

    private String notes;
}
