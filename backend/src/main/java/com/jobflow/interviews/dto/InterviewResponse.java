package com.jobflow.interviews.dto;

import com.jobflow.interviews.enums.InterviewMode;
import com.jobflow.interviews.enums.InterviewResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResponse {

    private Long id;

    private Long applicationId;

    private Long userId;

    private String roundName;

    private LocalDateTime interviewDate;

    private InterviewMode mode;

    private InterviewResult result;

    private String notes;

    private LocalDateTime createdAt;
}
