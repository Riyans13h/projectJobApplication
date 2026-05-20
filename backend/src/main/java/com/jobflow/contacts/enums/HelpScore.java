package com.jobflow.contacts.enums;

public enum HelpScore {
    ZERO(0, "No Help"),
    ONE(1, "Very Low"),
    TWO(2, "Very Low"),
    THREE(3, "Low"),
    FOUR(4, "Low"),
    FIVE(5, "Medium"),
    SIX(6, "Medium"),
    SEVEN(7, "High"),
    EIGHT(8, "High"),
    NINE(9, "Very High"),
    TEN(10, "Very High");

    private final int value;
    private final String label;

    HelpScore(int value, String label) {
        this.value = value;
        this.label = label;
    }

    public int getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public static HelpScore fromValue(int value) {
        for (HelpScore score : HelpScore.values()) {
            if (score.value == value) {
                return score;
            }
        }
        throw new IllegalArgumentException("Invalid help score: " + value);
    }
}
