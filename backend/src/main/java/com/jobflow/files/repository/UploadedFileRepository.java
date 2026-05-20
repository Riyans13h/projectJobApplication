package com.jobflow.files.repository;

import com.jobflow.files.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {

    Optional<UploadedFile> findByIdAndUserId(Long id, Long userId);

    List<UploadedFile> findByUserIdAndCompanyNameIgnoreCaseAndJobIdIgnoreCaseOrderByCreatedAtDesc(Long userId, String companyName, String jobId);
}
