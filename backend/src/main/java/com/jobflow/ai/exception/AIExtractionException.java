package com.jobflow.ai.exception;

public class AIExtractionException extends RuntimeException {

    public AIExtractionException(String message) {
        super(message);
    }

    public AIExtractionException(String message, Throwable cause) {
        super(message, cause);
    }
}
