package com.jobflow.applications.enums;

public enum WorkMode {
    REMOTE("Remote"),
    ONSITE("On-site"),
    HYBRID("Hybrid");

    private final String displayName;

    WorkMode(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
