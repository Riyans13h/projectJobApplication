package com.jobflow.applications.mapper;

import com.jobflow.applications.dto.ApplicationResponse;
import com.jobflow.applications.dto.CreateApplicationRequest;
import com.jobflow.applications.dto.UpdateApplicationRequest;
import com.jobflow.applications.entity.Application;
import com.jobflow.auth.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    /**
     * Map CreateApplicationRequest to Application entity
     */
    public Application toEntity(CreateApplicationRequest request, User user) {
        return Application.builder()
                .user(user)
                .userId(user.getId())
                .companyName(request.getCompanyName())
                .role(request.getRole())
                .jobId(request.getJobId())
                .location(request.getLocation())
                .workMode(request.getWorkMode())
                .employmentType(request.getEmploymentType())
                .status(request.getStatus())
                .priority(request.getPriority() != null ? request.getPriority() : 
                         com.jobflow.applications.enums.Priority.MEDIUM)
                .applicationDate(request.getApplicationDate())
                .appliedThrough(request.getAppliedThrough())
                .emailUsed(request.getEmailUsed())
                .phoneUsed(request.getPhoneUsed())
                .notes(request.getNotes())
                .cooldownPeriod(request.getCooldownPeriod())
                .build();
    }

    /**
     * Map UpdateApplicationRequest to Application entity
     */
    public void updateEntity(UpdateApplicationRequest request, Application application) {
        if (request.getCompanyName() != null) {
            application.setCompanyName(request.getCompanyName());
        }
        if (request.getRole() != null) {
            application.setRole(request.getRole());
        }
        if (request.getJobId() != null) {
            application.setJobId(request.getJobId());
        }
        if (request.getLocation() != null) {
            application.setLocation(request.getLocation());
        }
        if (request.getWorkMode() != null) {
            application.setWorkMode(request.getWorkMode());
        }
        if (request.getEmploymentType() != null) {
            application.setEmploymentType(request.getEmploymentType());
        }
        if (request.getStatus() != null) {
            application.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            application.setPriority(request.getPriority());
        }
        if (request.getApplicationDate() != null) {
            application.setApplicationDate(request.getApplicationDate());
        }
        if (request.getAppliedThrough() != null) {
            application.setAppliedThrough(request.getAppliedThrough());
        }
        if (request.getEmailUsed() != null) {
            application.setEmailUsed(request.getEmailUsed());
        }
        if (request.getPhoneUsed() != null) {
            application.setPhoneUsed(request.getPhoneUsed());
        }
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }
        if (request.getCooldownPeriod() != null) {
            application.setCooldownPeriod(request.getCooldownPeriod());
        }
    }

    /**
     * Map Application entity to ApplicationResponse
     */
    public ApplicationResponse toResponse(Application application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .userId(application.getUserId())
                .companyName(application.getCompanyName())
                .role(application.getRole())
                .jobId(application.getJobId())
                .location(application.getLocation())
                .workMode(application.getWorkMode())
                .employmentType(application.getEmploymentType())
                .status(application.getStatus())
                .priority(application.getPriority())
                .applicationDate(application.getApplicationDate())
                .appliedThrough(application.getAppliedThrough())
                .emailUsed(application.getEmailUsed())
                .phoneUsed(application.getPhoneUsed())
                .notes(application.getNotes())
                .cooldownPeriod(application.getCooldownPeriod())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
