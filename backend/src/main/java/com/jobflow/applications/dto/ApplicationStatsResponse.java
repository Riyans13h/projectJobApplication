package com.jobflow.applications.dto;

import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatsResponse {

    private Long totalApplications;

    private Long appliedCount;

    private Long oaReceivedCount;

    private Long interviewScheduledCount;

    private Long offersCount;

    private Long rejectedCount;

    private Long highPriorityCount;

    private Long activeCooldownCount;
}
