package com.jobflow.files.controller;

import com.jobflow.auth.service.JwtService;
import com.jobflow.files.dto.FileUploadResponse;
import com.jobflow.files.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.security.cors.allowed-origins}")
public class FileController {

    private final FileService fileService;
    private final JwtService jwtService;

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadResume(
            @RequestPart("file") MultipartFile file,
            @RequestParam String company,
            @RequestParam String jobId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Resume upload request received for company: {}", company);

        Long userId = extractUserIdFromToken(authHeader);
        FileUploadResponse response = fileService.uploadResume(file, company, jobId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/jd", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadJd(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String jobId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("JD upload request received");

        Long userId = extractUserIdFromToken(authHeader);
        FileUploadResponse response = fileService.uploadJd(file, company, jobId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/cover-letter", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadCoverLetter(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String jobId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Cover letter upload request received");

        Long userId = extractUserIdFromToken(authHeader);
        FileUploadResponse response = fileService.uploadCoverLetter(file, company, jobId, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<FileUploadResponse> deleteFile(
            @PathVariable Long fileId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Delete file request received for id: {}", fileId);

        Long userId = extractUserIdFromToken(authHeader);
        FileUploadResponse response = fileService.deleteFile(fileId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FileUploadResponse>> getFiles(
            @RequestParam String company,
            @RequestParam String jobId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Get files request received for company: {} and jobId: {}", company, jobId);

        Long userId = extractUserIdFromToken(authHeader);
        List<FileUploadResponse> response = fileService.getFiles(company, jobId, userId);
        return ResponseEntity.ok(response);
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
