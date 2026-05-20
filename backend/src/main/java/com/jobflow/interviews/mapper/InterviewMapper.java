package com.jobflow.interviews.mapper;

import com.jobflow.applications.entity.Application;
import com.jobflow.interviews.dto.CreateInterviewRequest;
import com.jobflow.interviews.dto.InterviewResponse;
import com.jobflow.interviews.dto.UpdateInterviewRequest;
import com.jobflow.interviews.entity.Interview;
import com.jobflow.interviews.enums.InterviewResult;
import org.springframework.stereotype.Component;

@Component
public class InterviewMapper {

    public Interview toEntity(CreateInterviewRequest request, Application application) {
        return Interview.builder()
                .application(application)
                .roundName(request.getRoundName())
                .interviewDate(request.getInterviewDate())
                .mode(request.getMode())
                .result(request.getResult() != null ? request.getResult() : InterviewResult.PENDING)
                .notes(request.getNotes())
                .build();
    }

    public void updateEntity(UpdateInterviewRequest request, Interview interview) {
        if (request.getRoundName() != null) {
            interview.setRoundName(request.getRoundName());
        }
        if (request.getInterviewDate() != null) {
            interview.setInterviewDate(request.getInterviewDate());
        }
        if (request.getMode() != null) {
            interview.setMode(request.getMode());
        }
        if (request.getResult() != null) {
            interview.setResult(request.getResult());
        }
        if (request.getNotes() != null) {
            interview.setNotes(request.getNotes());
        }
    }

    public InterviewResponse toResponse(Interview interview) {
        Application application = interview.getApplication();

        return InterviewResponse.builder()
                .id(interview.getId())
                .applicationId(application.getId())
                .userId(application.getUserId())
                .roundName(interview.getRoundName())
                .interviewDate(interview.getInterviewDate())
                .mode(interview.getMode())
                .result(interview.getResult())
                .notes(interview.getNotes())
                .createdAt(interview.getCreatedAt())
                .build();
    }
}
