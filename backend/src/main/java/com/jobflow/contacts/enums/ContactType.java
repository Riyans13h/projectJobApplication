package com.jobflow.contacts.enums;

public enum ContactType {
    REFERRAL("Referral"),
    RECRUITER("Recruiter"),
    HR("HR"),
    HIRING_MANAGER("Hiring Manager"),
    MENTOR("Mentor"),
    COLD_MAIL("Cold Mail"),
    ALUMNI("Alumni"),
    FRIEND("Friend");

    private final String displayName;

    ContactType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
