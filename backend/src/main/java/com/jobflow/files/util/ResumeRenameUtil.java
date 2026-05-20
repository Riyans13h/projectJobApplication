package com.jobflow.files.util;

import com.jobflow.auth.entity.User;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.UUID;

@Component
public class ResumeRenameUtil {

    public String buildResumeFileName(User user, String companyName, String jobId) {
        return sanitize(user.getFirstName()) + "_"
                + sanitize(user.getLastName()) + "_"
                + sanitize(companyName) + "_"
                + sanitize(jobId) + ".pdf";
    }

    public String buildSafePublicId(String folder, String fileName) {
        String fileNameWithoutExtension = fileName.replaceFirst("(?i)\\.pdf$", "");
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        return folder + "/" + fileNameWithoutExtension + "_" + suffix;
    }

    public String sanitize(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        normalized = normalized.replaceAll("[^a-z0-9]+", "_");
        normalized = normalized.replaceAll("_+", "_");
        normalized = normalized.replaceAll("^_|_$", "");
        return normalized.isBlank() ? "unknown" : normalized;
    }
}
