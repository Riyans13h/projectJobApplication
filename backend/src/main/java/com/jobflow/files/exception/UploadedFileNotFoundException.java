package com.jobflow.files.exception;

public class UploadedFileNotFoundException extends RuntimeException {

    public UploadedFileNotFoundException(String message) {
        super(message);
    }
}
