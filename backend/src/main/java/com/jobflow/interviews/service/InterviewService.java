package com.jobflow.interviews.service;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.exception.ApplicationNotFoundException;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.interviews.dto.CreateInterviewRequest;
import com.jobflow.interviews.dto.InterviewResponse;
import com.jobflow.interviews.dto.UpdateInterviewRequest;
import com.jobflow.interviews.entity.Interview;
import com.jobflow.interviews.enums.InterviewResult;
import com.jobflow.interviews.exception.InterviewNotFoundException;
import com.jobflow.interviews.mapper.InterviewMapper;
import com.jobflow.interviews.repository.InterviewRepository;
import com.jobflow.timeline.service.TimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewMapper interviewMapper;
    private final TimelineService timelineService;

    public InterviewResponse addInterviewRound(Long applicationId, CreateInterviewRequest request, Long userId) {
        log.info("Adding interview round for application: {} and user: {}", applicationId, userId);

        Application application = findApplicationForUser(applicationId, userId);
        Interview interview = interviewMapper.toEntity(request, application);
        Interview savedInterview = interviewRepository.save(interview);
        timelineService.recordApplicationEvent(
                application,
                "Interview Added",
                "Interview round added: " + savedInterview.getRoundName()
        );

        log.info("Interview created with id: {} for application: {}", savedInterview.getId(), applicationId);
        return interviewMapper.toResponse(savedInterview);
    }

    @Transactional(readOnly = true)
    public Page<InterviewResponse> getInterviewsForApplication(Long applicationId, Long userId, Pageable pageable) {
        log.info("Fetching interviews for application: {} and user: {}", applicationId, userId);

        findApplicationForUser(applicationId, userId);
        return interviewRepository.findByApplication_IdAndApplication_UserId(applicationId, userId, pageable)
                .map(interviewMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public InterviewResponse getInterviewById(Long id, Long userId) {
        log.info("Fetching interview: {} for user: {}", id, userId);
        return findInterviewForUser(id, userId)
                .map(interviewMapper::toResponse)
                .orElseThrow(() -> new InterviewNotFoundException("Interview not found with id: " + id));
    }

    public InterviewResponse updateInterview(Long id, UpdateInterviewRequest request, Long userId) {
        log.info("Updating interview: {} for user: {}", id, userId);

        Interview interview = findInterviewForUser(id, userId)
                .orElseThrow(() -> new InterviewNotFoundException("Interview not found with id: " + id));
        interviewMapper.updateEntity(request, interview);
        Interview updatedInterview = interviewRepository.save(interview);

        log.info("Interview updated: {} for user: {}", id, userId);
        return interviewMapper.toResponse(updatedInterview);
    }

    public InterviewResponse updateInterviewResult(Long id, InterviewResult result, Long userId) {
        log.info("Updating interview result: {} to {} for user: {}", id, result, userId);

        Interview interview = findInterviewForUser(id, userId)
                .orElseThrow(() -> new InterviewNotFoundException("Interview not found with id: " + id));
        interview.setResult(result);
        Interview updatedInterview = interviewRepository.save(interview);
        timelineService.recordApplicationEvent(
                updatedInterview.getApplication(),
                "Interview Result Updated",
                "Interview result updated to " + result.getDisplayName() + " for " + updatedInterview.getRoundName()
        );

        return interviewMapper.toResponse(updatedInterview);
    }

    public void deleteInterview(Long id, Long userId) {
        log.info("Deleting interview: {} for user: {}", id, userId);

        Interview interview = findInterviewForUser(id, userId)
                .orElseThrow(() -> new InterviewNotFoundException("Interview not found with id: " + id));
        interviewRepository.delete(interview);

        log.info("Interview deleted: {} for user: {}", id, userId);
    }

    private Application findApplicationForUser(Long applicationId, Long userId) {
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found with id: " + applicationId));
    }

    private Optional<Interview> findInterviewForUser(Long id, Long userId) {
        return interviewRepository.findByIdAndApplication_UserId(id, userId);
    }
}
