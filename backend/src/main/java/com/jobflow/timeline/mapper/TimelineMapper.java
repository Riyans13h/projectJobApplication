package com.jobflow.timeline.mapper;

import com.jobflow.applications.entity.Application;
import com.jobflow.timeline.dto.CreateTimelineRequest;
import com.jobflow.timeline.dto.TimelineResponse;
import com.jobflow.timeline.entity.Timeline;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TimelineMapper {

    public Timeline toEntity(CreateTimelineRequest request, Application application) {
        return Timeline.builder()
                .application(application)
                .event(request.getEvent())
                .notes(request.getNotes())
                .eventDate(request.getEventDate() != null ? request.getEventDate() : LocalDateTime.now())
                .build();
    }

    public Timeline toEntity(Application application, String event, String notes, LocalDateTime eventDate) {
        return Timeline.builder()
                .application(application)
                .event(event)
                .notes(notes)
                .eventDate(eventDate != null ? eventDate : LocalDateTime.now())
                .build();
    }

    public TimelineResponse toResponse(Timeline timeline) {
        Application application = timeline.getApplication();

        return TimelineResponse.builder()
                .id(timeline.getId())
                .applicationId(application.getId())
                .userId(application.getUserId())
                .event(timeline.getEvent())
                .notes(timeline.getNotes())
                .eventDate(timeline.getEventDate())
                .createdAt(timeline.getCreatedAt())
                .build();
    }
}
