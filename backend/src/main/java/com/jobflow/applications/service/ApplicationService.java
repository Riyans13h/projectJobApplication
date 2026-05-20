package com.jobflow.applications.service;

import com.jobflow.applications.dto.ApplicationResponse;
import com.jobflow.applications.dto.ApplicationStatsResponse;
import com.jobflow.applications.dto.CreateApplicationRequest;
import com.jobflow.applications.dto.UpdateApplicationRequest;
import com.jobflow.applications.entity.Application;
import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.Priority;
import com.jobflow.applications.exception.ApplicationNotFoundException;
import com.jobflow.applications.exception.UnauthorizedAccessException;
import com.jobflow.applications.mapper.ApplicationMapper;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.auth.entity.User;
import com.jobflow.auth.service.AuthService;
import com.jobflow.interviews.repository.InterviewRepository;
import com.jobflow.timeline.repository.TimelineRepository;
import com.jobflow.timeline.service.TimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;
    private final TimelineService timelineService;
    private final TimelineRepository timelineRepository;
    private final InterviewRepository interviewRepository;
    private final AuthService authService;

    /**
     * Create a new application for logged-in user
     */
    public ApplicationResponse createApplication(CreateApplicationRequest request, Long userId) {
        log.info("Creating new application for user: {}", userId);

        User user = authService.getUserById(userId);
        Application application = applicationMapper.toEntity(request, user);
        Application savedApplication = applicationRepository.save(application);
        timelineService.recordApplicationEvent(
                savedApplication,
                "Application Created",
                "Application created for " + savedApplication.getRole() + " at " + savedApplication.getCompanyName()
        );

        log.info("Application created with id: {} for user: {}", savedApplication.getId(), userId);
        return applicationMapper.toResponse(savedApplication);
    }

    /**
     * Get all applications for logged-in user with pagination
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(Long userId, Pageable pageable) {
        log.info("Fetching all applications for user: {}", userId);
        return applicationRepository.findByUserId(userId, pageable)
                .map(applicationMapper::toResponse);
    }

    /**
     * Get application by id
     */
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id, Long userId) {
        log.info("Fetching application: {} for user: {}", id, userId);

        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> {
                    log.warn("Application not found: {} for user: {}", id, userId);
                    return new ApplicationNotFoundException("Application not found with id: " + id);
                });

        return applicationMapper.toResponse(application);
    }

    /**
     * Update application
     */
    public ApplicationResponse updateApplication(Long id, UpdateApplicationRequest request, Long userId) {
        log.info("Updating application: {} for user: {}", id, userId);

        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found with id: " + id));

        applicationMapper.updateEntity(request, application);
        Application updatedApplication = applicationRepository.save(application);

        log.info("Application updated: {} for user: {}", id, userId);
        return applicationMapper.toResponse(updatedApplication);
    }

    /**
     * Update application status
     */
    public ApplicationResponse updateApplicationStatus(Long id, ApplicationStatus status, Long userId) {
        log.info("Updating application status: {} to {} for user: {}", id, status, userId);

        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found with id: " + id));

        application.setStatus(status);
        Application updatedApplication = applicationRepository.save(application);
        timelineService.recordApplicationEvent(
                updatedApplication,
                resolveStatusEvent(status),
                "Application status updated to " + status.getDisplayName()
        );

        log.info("Application status updated: {}", id);
        return applicationMapper.toResponse(updatedApplication);
    }

    /**
     * Delete application
     */
    public void deleteApplication(Long id, Long userId) {
        log.info("Deleting application: {} for user: {}", id, userId);

        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found with id: " + id));

        timelineRepository.deleteByApplication_Id(application.getId());
        interviewRepository.deleteByApplication_Id(application.getId());
        applicationRepository.delete(application);
        log.info("Application deleted: {} for user: {}", id, userId);
    }

    /**
     * Get applications by status with pagination
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByStatus(Long userId, ApplicationStatus status, Pageable pageable) {
        log.info("Fetching applications with status: {} for user: {}", status, userId);
        return applicationRepository.findByUserIdAndStatus(userId, status, pageable)
                .map(applicationMapper::toResponse);
    }

    /**
     * Get applications by company name with pagination
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByCompany(Long userId, String companyName, Pageable pageable) {
        log.info("Fetching applications for company: {} and user: {}", companyName, userId);
        return applicationRepository.findByUserIdAndCompanyNameContainingIgnoreCase(userId, companyName, pageable)
                .map(applicationMapper::toResponse);
    }

    /**
     * Get applications by priority with pagination
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByPriority(Long userId, Priority priority, Pageable pageable) {
        log.info("Fetching applications with priority: {} for user: {}", priority, userId);
        return applicationRepository.findByUserIdAndPriority(userId, priority, pageable)
                .map(applicationMapper::toResponse);
    }

    /**
     * Advanced filtering with multiple criteria
     */
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsWithFilters(
            Long userId,
            ApplicationStatus status,
            String company,
            Priority priority,
            Pageable pageable) {
        log.info("Fetching applications with filters for user: {}", userId);
        return applicationRepository.findByUserIdWithFilters(userId, status, company, priority, pageable)
                .map(applicationMapper::toResponse);
    }

    /**
     * Get application statistics for dashboard
     */
    @Transactional(readOnly = true)
    public ApplicationStatsResponse getApplicationStats(Long userId) {
        log.info("Fetching application stats for user: {}", userId);

        Long totalApplications = applicationRepository.countByUserId(userId);
        Long appliedCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);
        Long oaReceivedCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OA_RECEIVED);
        Long interviewScheduledCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW_SCHEDULED);
        Long offersCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER_RECEIVED);
        Long rejectedCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED);
        Long highPriorityCount = applicationRepository.findByUserIdAndPriority(userId, Priority.HIGH, Pageable.unpaged())
                .getTotalElements();
        Long activeCooldownCount = applicationRepository.findByUserIdAndCooldownPeriodGreaterThan(userId, 0)
                .stream()
                .filter(application -> application.getApplicationDate() != null
                        && application.getCooldownPeriod() != null
                        && LocalDate.now().isBefore(application.getApplicationDate().plusDays(application.getCooldownPeriod())))
                .count();

        return ApplicationStatsResponse.builder()
                .totalApplications(totalApplications)
                .appliedCount(appliedCount)
                .oaReceivedCount(oaReceivedCount)
                .interviewScheduledCount(interviewScheduledCount)
                .offersCount(offersCount)
                .rejectedCount(rejectedCount)
                .highPriorityCount(highPriorityCount)
                .activeCooldownCount(activeCooldownCount)
                .build();
    }

    private String resolveStatusEvent(ApplicationStatus status) {
        return switch (status) {
            case OFFER_RECEIVED -> "Offer Received";
            case REJECTED -> "Rejected";
            default -> "Status Updated";
        };
    }
}
