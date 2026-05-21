package com.jobflow.files.service;

import com.cloudinary.Cloudinary;
import com.jobflow.auth.entity.User;
import com.jobflow.auth.service.AuthService;
import com.jobflow.files.dto.FileUploadResponse;
import com.jobflow.files.entity.UploadedFile;
import com.jobflow.files.exception.FileStorageException;
import com.jobflow.files.exception.UploadedFileNotFoundException;
import com.jobflow.files.repository.UploadedFileRepository;
import com.jobflow.files.util.ResumeRenameUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FileService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final String RESOURCE_TYPE_RAW = "raw";
    private static final String FILE_TYPE_RESUME = "RESUME";
    private static final String FILE_TYPE_JD = "JD";
    private static final String FILE_TYPE_COVER_LETTER = "COVER_LETTER";

    private final Cloudinary cloudinary;
    private final UploadedFileRepository uploadedFileRepository;
    private final AuthService authService;
    private final ResumeRenameUtil resumeRenameUtil;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${app.file-storage.local-dir}")
    private String localStorageDir;

    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    public FileUploadResponse uploadResume(MultipartFile file, String company, String jobId, Long userId) {
        validateRequiredText(company, "Company is required for resume upload");
        validateRequiredText(jobId, "Job ID is required for resume upload");

        User user = authService.getUserById(userId);
        String storedFileName = resumeRenameUtil.buildResumeFileName(user, company, jobId);
        return uploadPdf(file, userId, FILE_TYPE_RESUME, storedFileName, company.trim(), jobId.trim(), "jobflow/resumes");
    }

    public FileUploadResponse uploadJd(MultipartFile file, String company, String jobId, Long userId) {
        String storedFileName = buildGenericFileName(file, "jd");
        return uploadPdf(file, userId, FILE_TYPE_JD, storedFileName, trimToNull(company), trimToNull(jobId), "jobflow/jds");
    }

    public FileUploadResponse uploadCoverLetter(MultipartFile file, String company, String jobId, Long userId) {
        String storedFileName = buildGenericFileName(file, "cover_letter");
        return uploadPdf(file, userId, FILE_TYPE_COVER_LETTER, storedFileName, trimToNull(company), trimToNull(jobId),
                "jobflow/cover-letters");
    }

    public FileUploadResponse deleteFile(Long fileId, Long userId) {
        log.info("Deleting uploaded file: {} for user: {}", fileId, userId);

        UploadedFile uploadedFile = uploadedFileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new UploadedFileNotFoundException("Uploaded file not found with id: " + fileId));

        try {
            deleteStoredFile(uploadedFile);
            uploadedFileRepository.delete(uploadedFile);

            return toResponse(uploadedFile, "File deleted successfully");
        } catch (IOException e) {
            throw new FileStorageException("Failed to delete uploaded file", e);
        }
    }

    @Transactional(readOnly = true)
    public List<FileUploadResponse> getFiles(String company, String jobId, Long userId) {
        validateRequiredText(company, "Company is required");
        validateRequiredText(jobId, "Job ID is required");

        return uploadedFileRepository
                .findByUserIdAndCompanyNameIgnoreCaseAndJobIdIgnoreCaseOrderByCreatedAtDesc(userId, company.trim(), jobId.trim())
                .stream()
                .map(file -> toResponse(file, "File found"))
                .toList();
    }

    private FileUploadResponse uploadPdf(
            MultipartFile file,
            Long userId,
            String fileType,
            String storedFileName,
            String company,
            String jobId,
            String folder) {
        validatePdf(file);
        String publicId = buildUniquePublicId(folder, storedFileName);

        try {
            if (!isCloudinaryConfigured()) {
                return uploadPdfLocally(file, userId, fileType, storedFileName, company, jobId, publicId);
            }

            log.info("Uploading {} file to Cloudinary for user: {}", fileType, userId);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of(
                    "resource_type", RESOURCE_TYPE_RAW,
                    "public_id", publicId,
                    "overwrite", false
            ));

            String fileUrl = String.valueOf(uploadResult.get("secure_url"));
            if (fileUrl == null || fileUrl.isBlank() || "null".equals(fileUrl)) {
                throw new FileStorageException("Cloudinary upload did not return a secure URL");
            }

            UploadedFile uploadedFile = UploadedFile.builder()
                    .userId(userId)
                    .fileType(fileType)
                    .originalFileName(resolveOriginalFileName(file))
                    .storedFileName(storedFileName)
                    .publicId(publicId)
                    .fileUrl(fileUrl)
                    .contentType(resolveContentType(file))
                    .fileSize(file.getSize())
                    .companyName(company)
                    .jobId(jobId)
                    .build();

            UploadedFile savedFile = uploadedFileRepository.save(uploadedFile);
            return toResponse(savedFile, "File uploaded successfully");
        } catch (IOException e) {
            throw new FileStorageException("Failed to upload file to Cloudinary", e);
        }
    }

    private FileUploadResponse uploadPdfLocally(
            MultipartFile file,
            Long userId,
            String fileType,
            String storedFileName,
            String company,
            String jobId,
            String publicId) throws IOException {
        log.info("Cloudinary is not configured. Saving {} file locally for user: {}", fileType, userId);

        Path localPath = Path.of(localStorageDir).resolve(publicId).normalize();
        Files.createDirectories(localPath.getParent());
        Files.copy(file.getInputStream(), localPath, StandardCopyOption.REPLACE_EXISTING);

        UploadedFile uploadedFile = UploadedFile.builder()
                .userId(userId)
                .fileType(fileType)
                .originalFileName(resolveOriginalFileName(file))
                .storedFileName(storedFileName)
                .publicId("local/" + publicId)
                .fileUrl(buildLocalFileUrl(publicId))
                .contentType(resolveContentType(file))
                .fileSize(file.getSize())
                .companyName(company)
                .jobId(jobId)
                .build();

        UploadedFile savedFile = uploadedFileRepository.save(uploadedFile);
        return toResponse(savedFile, "File uploaded locally");
    }

    private void deleteStoredFile(UploadedFile uploadedFile) throws IOException {
        if (uploadedFile.getPublicId() != null && uploadedFile.getPublicId().startsWith("local/")) {
            String relativePath = uploadedFile.getPublicId().substring("local/".length());
            Files.deleteIfExists(Path.of(localStorageDir).resolve(relativePath).normalize());
            return;
        }

        cloudinary.uploader().destroy(uploadedFile.getPublicId(), Map.of("resource_type", RESOURCE_TYPE_RAW));
    }

    private boolean isCloudinaryConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    private String buildLocalFileUrl(String publicId) {
        String baseUrl = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return baseUrl + "/uploads/" + publicId;
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size must not exceed 10MB");
        }

        String originalFileName = resolveOriginalFileName(file);
        String contentType = resolveContentType(file);
        if (!PDF_CONTENT_TYPE.equalsIgnoreCase(contentType) || !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }

    private String buildGenericFileName(MultipartFile file, String fallbackName) {
        String originalFileName = resolveOriginalFileName(file);
        String nameWithoutExtension = originalFileName.replaceFirst("(?i)\\.pdf$", "");
        String sanitizedName = resumeRenameUtil.sanitize(nameWithoutExtension);
        if ("unknown".equals(sanitizedName)) {
            sanitizedName = fallbackName;
        }

        return sanitizedName + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";
    }

    private String buildUniquePublicId(String folder, String storedFileName) {
        String nameWithoutExtension = storedFileName.replaceFirst("(?i)\\.pdf$", "");
        return folder + "/" + nameWithoutExtension + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";
    }

    private String resolveOriginalFileName(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        return originalFileName == null || originalFileName.isBlank() ? "uploaded.pdf" : originalFileName.trim();
    }

    private String resolveContentType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType;
    }

    private void validateRequiredText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private FileUploadResponse toResponse(UploadedFile uploadedFile, String message) {
        LocalDateTime uploadedAt = uploadedFile.getCreatedAt();
        return FileUploadResponse.builder()
                .fileId(uploadedFile.getId())
                .fileType(uploadedFile.getFileType())
                .originalFileName(uploadedFile.getOriginalFileName())
                .storedFileName(uploadedFile.getStoredFileName())
                .publicId(uploadedFile.getPublicId())
                .fileUrl(uploadedFile.getFileUrl())
                .downloadUrl(buildDownloadUrl(uploadedFile.getFileUrl()))
                .fileSize(uploadedFile.getFileSize())
                .contentType(uploadedFile.getContentType())
                .uploadedAt(uploadedAt)
                .message(message)
                .build();
    }

    private String buildDownloadUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/upload/")) {
            return fileUrl;
        }

        return fileUrl.replace("/upload/", "/upload/fl_attachment/");
    }
}
