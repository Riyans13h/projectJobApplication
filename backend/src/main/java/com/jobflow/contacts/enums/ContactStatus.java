package com.jobflow.contacts.enums;

public enum ContactStatus {
    NOT_CONTACTED("Not Contacted"),
    MESSAGE_SENT("Message Sent"),
    RESPONDED("Responded"),
    REFERRAL_GIVEN("Referral Given"),
    REJECTED("Rejected"),
    FOLLOW_UP_NEEDED("Follow-Up Needed");

    private final String displayName;

    ContactStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
