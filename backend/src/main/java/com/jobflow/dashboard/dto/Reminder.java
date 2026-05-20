package com.jobflow.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {

    private String type;

    private String title;

    private String message;

    private LocalDateTime dueDate;

    private Long applicationId;

    private Long interviewId;

    private Long contactId;

    private String companyName;
}
