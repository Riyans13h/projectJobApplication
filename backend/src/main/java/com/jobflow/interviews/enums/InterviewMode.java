package com.jobflow.interviews.enums;

public enum InterviewMode {
    PHONE("Phone"),
    VIDEO("Video"),
    ONSITE("On-site"),
    ONLINE_ASSESSMENT("Online Assessment");

    private final String displayName;

    InterviewMode(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
