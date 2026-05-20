package com.jobflow.interviews.enums;

public enum InterviewResult {
    PENDING("Pending"),
    PASSED("Passed"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled"),
    NO_SHOW("No Show");

    private final String displayName;

    InterviewResult(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
