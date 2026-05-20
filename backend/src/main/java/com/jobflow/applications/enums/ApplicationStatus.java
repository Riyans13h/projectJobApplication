package com.jobflow.applications.enums;

public enum ApplicationStatus {
    APPLIED("Applied"),
    OA_RECEIVED("OA Received"),
    OA_SUBMITTED("OA Submitted"),
    INTERVIEW_SCHEDULED("Interview Scheduled"),
    INTERVIEW_IN_PROGRESS("Interview In Progress"),
    INTERVIEW_COMPLETED("Interview Completed"),
    OFFER_RECEIVED("Offer Received"),
    REJECTED("Rejected"),
    WITHDRAWN("Withdrawn"),
    HOLD("Hold");

    private final String displayName;

    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
