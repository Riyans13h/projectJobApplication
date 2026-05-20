package com.jobflow.interviews.exception;

public class InterviewNotFoundException extends RuntimeException {

    public InterviewNotFoundException(String message) {
        super(message);
    }

    public InterviewNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
