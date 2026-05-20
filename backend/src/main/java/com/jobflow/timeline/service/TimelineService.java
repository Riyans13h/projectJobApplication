package com.jobflow.timeline.service;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.exception.ApplicationNotFoundException;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.timeline.dto.CreateTimelineRequest;
import com.jobflow.timeline.dto.TimelineResponse;
import com.jobflow.timeline.entity.Timeline;
import com.jobflow.timeline.exception.TimelineNotFoundException;
import com.jobflow.timeline.mapper.TimelineMapper;
import com.jobflow.timeline.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TimelineService {

    private final TimelineRepository timelineRepository;
    private final ApplicationRepository applicationRepository;
    private final TimelineMapper timelineMapper;

    public TimelineResponse addTimelineEntry(Long applicationId, CreateTimelineRequest request, Long userId) {
        log.info("Adding timeline entry for application: {} and user: {}", applicationId, userId);

        Application application = findApplicationForUser(applicationId, userId);
        Timeline timeline = timelineMapper.toEntity(request, application);
        Timeline savedTimeline = timelineRepository.save(timeline);

        log.info("Timeline entry created with id: {} for application: {}", savedTimeline.getId(), applicationId);
        return timelineMapper.toResponse(savedTimeline);
    }

    @Transactional(readOnly = true)
    public Page<TimelineResponse> getTimelineForApplication(Long applicationId, Long userId, Pageable pageable) {
        log.info("Fetching timeline for application: {} and user: {}", applicationId, userId);

        findApplicationForUser(applicationId, userId);
        return timelineRepository.findByApplication_IdAndApplication_UserId(applicationId, userId, pageable)
                .map(timelineMapper::toResponse);
    }

    public void deleteTimelineEntry(Long id, Long userId) {
        log.info("Deleting timeline entry: {} for user: {}", id, userId);

        Timeline timeline = timelineRepository.findByIdAndApplication_UserId(id, userId)
                .orElseThrow(() -> new TimelineNotFoundException("Timeline entry not found with id: " + id));
        timelineRepository.delete(timeline);

        log.info("Timeline entry deleted: {} for user: {}", id, userId);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordApplicationEvent(Application application, String event, String notes) {
        Timeline timeline = timelineMapper.toEntity(application, event, notes, LocalDateTime.now());
        timelineRepository.save(timeline);
        log.debug("Timeline event recorded for application: {} event: {}", application.getId(), event);
    }

    private Application findApplicationForUser(Long applicationId, Long userId) {
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found with id: " + applicationId));
    }
}
