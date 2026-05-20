package com.jobflow.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {

    private Long totalApplications;

    private Long activeApplications;

    private Long oaPending;

    private Long interviewsScheduled;

    private Long interviewsCompleted;

    private Long offersReceived;

    private Long rejectedCount;

    private Double rejectionRate;

    private Long activeCooldowns;

    private Long pendingFollowups;
}
