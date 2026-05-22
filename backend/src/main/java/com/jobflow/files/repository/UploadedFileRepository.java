package com.jobflow.files.repository;

import com.jobflow.files.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {

    Optional<UploadedFile> findByIdAndUserId(Long id, Long userId);

    List<UploadedFile> findByUserIdAndCompanyNameIgnoreCaseAndJobIdIgnoreCaseOrderByCreatedAtDesc(Long userId, String companyName, String jobId);

    @Query("""
            SELECT f FROM UploadedFile f
            WHERE f.userId = :userId
            AND LOWER(f.companyName) = LOWER(:companyName)
            AND (
                (:jobId IS NULL AND f.jobId IS NULL)
                OR (:jobId IS NOT NULL AND LOWER(f.jobId) = LOWER(:jobId))
            )
            ORDER BY f.createdAt DESC
            """)
    List<UploadedFile> findApplicationFiles(
            @Param("userId") Long userId,
            @Param("companyName") String companyName,
            @Param("jobId") String jobId
    );
}
