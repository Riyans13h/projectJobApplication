package com.jobflow.files.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {

    private Long fileId;

    private String fileType;

    private String originalFileName;

    private String storedFileName;

    private String publicId;

    private String fileUrl;

    private String downloadUrl;

    private Long fileSize;

    private String contentType;

    private LocalDateTime uploadedAt;

    private String message;
}
