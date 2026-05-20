package com.jobflow.timeline.exception;

public class TimelineNotFoundException extends RuntimeException {

    public TimelineNotFoundException(String message) {
        super(message);
    }

    public TimelineNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
