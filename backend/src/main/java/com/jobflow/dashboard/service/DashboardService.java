package com.jobflow.dashboard.service;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.contacts.entity.Contact;
import com.jobflow.contacts.repository.ContactRepository;
import com.jobflow.dashboard.dto.DashboardStats;
import com.jobflow.dashboard.dto.Reminder;
import com.jobflow.interviews.entity.Interview;
import com.jobflow.interviews.enums.InterviewResult;
import com.jobflow.interviews.repository.InterviewRepository;
import com.jobflow.timeline.dto.TimelineResponse;
import com.jobflow.timeline.mapper.TimelineMapper;
import com.jobflow.timeline.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private static final int REMINDER_LIMIT = 20;

    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final ContactRepository contactRepository;
    private final TimelineRepository timelineRepository;
    private final TimelineMapper timelineMapper;

    public DashboardStats getDashboardStats(Long userId) {
        log.info("Fetching dashboard stats for user: {}", userId);

        Long totalApplications = applicationRepository.countByUserId(userId);
        Long rejectedCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED);
        Long activeApplications = applicationRepository.countByUserIdAndStatusIn(userId, List.of(
                ApplicationStatus.APPLIED,
                ApplicationStatus.OA_RECEIVED,
                ApplicationStatus.OA_SUBMITTED,
                ApplicationStatus.INTERVIEW_SCHEDULED,
                ApplicationStatus.INTERVIEW_IN_PROGRESS,
                ApplicationStatus.INTERVIEW_COMPLETED,
                ApplicationStatus.HOLD
        ));

        Long pendingFollowups = contactRepository.countPendingFollowups(userId, LocalDate.now());
        Long activeCooldowns = countActiveCooldowns(userId);
        double rejectionRate = totalApplications == 0
                ? 0.0
                : Math.round((rejectedCount * 10000.0) / totalApplications) / 100.0;

        return DashboardStats.builder()
                .totalApplications(totalApplications)
                .activeApplications(activeApplications)
                .oaPending(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OA_RECEIVED))
                .interviewsScheduled(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW_SCHEDULED))
                .interviewsCompleted(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW_COMPLETED))
                .offersReceived(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER_RECEIVED))
                .rejectedCount(rejectedCount)
                .rejectionRate(rejectionRate)
                .activeCooldowns(activeCooldowns)
                .pendingFollowups(pendingFollowups)
                .build();
    }

    public Page<TimelineResponse> getRecentApplicationActivity(Long userId, Pageable pageable) {
        log.info("Fetching recent application activity for user: {}", userId);
        return timelineRepository.findByApplication_UserId(userId, pageable)
                .map(timelineMapper::toResponse);
    }

    public List<Reminder> getPendingReminders(Long userId) {
        log.info("Fetching pending reminders for user: {}", userId);

        List<Reminder> reminders = new ArrayList<>();
        reminders.addAll(getUpcomingInterviewReminders(userId));
        reminders.addAll(getPendingFollowupReminders(userId));
        reminders.addAll(getActiveCooldownAlerts(userId));

        return reminders.stream()
                .sorted((left, right) -> compareNullableDates(left.getDueDate(), right.getDueDate()))
                .limit(REMINDER_LIMIT)
                .toList();
    }

    private List<Reminder> getUpcomingInterviewReminders(Long userId) {
        Pageable pageable = PageRequest.of(0, REMINDER_LIMIT, Sort.by(Sort.Direction.ASC, "interviewDate"));
        return interviewRepository.findUpcomingInterviews(userId, LocalDateTime.now(), InterviewResult.PENDING, pageable)
                .stream()
                .map(this::toInterviewReminder)
                .toList();
    }

    private List<Reminder> getPendingFollowupReminders(Long userId) {
        Pageable pageable = PageRequest.of(0, REMINDER_LIMIT, Sort.by(Sort.Direction.ASC, "nextFollowupDate"));
        return contactRepository.findPendingFollowups(userId, LocalDate.now(), pageable)
                .stream()
                .map(this::toFollowupReminder)
                .toList();
    }

    private List<Reminder> getActiveCooldownAlerts(Long userId) {
        return applicationRepository.findByUserIdAndCooldownPeriodGreaterThan(userId, 0)
                .stream()
                .filter(this::isCooldownActive)
                .map(this::toCooldownReminder)
                .toList();
    }

    private Long countActiveCooldowns(Long userId) {
        return applicationRepository.findByUserIdAndCooldownPeriodGreaterThan(userId, 0)
                .stream()
                .filter(this::isCooldownActive)
                .count();
    }

    private boolean isCooldownActive(Application application) {
        return application.getApplicationDate() != null
                && application.getCooldownPeriod() != null
                && LocalDate.now().isBefore(application.getApplicationDate().plusDays(application.getCooldownPeriod()));
    }

    private Reminder toInterviewReminder(Interview interview) {
        Application application = interview.getApplication();
        return Reminder.builder()
                .type("UPCOMING_INTERVIEW")
                .title("Upcoming interview")
                .message(interview.getRoundName() + " interview for " + application.getCompanyName())
                .dueDate(interview.getInterviewDate())
                .applicationId(application.getId())
                .interviewId(interview.getId())
                .companyName(application.getCompanyName())
                .build();
    }

    private Reminder toFollowupReminder(Contact contact) {
        LocalDate followupDate = contact.getNextFollowupDate();
        return Reminder.builder()
                .type("PENDING_FOLLOWUP")
                .title("Follow up with " + contact.getName())
                .message("Follow up" + (contact.getCompany() != null ? " at " + contact.getCompany() : ""))
                .dueDate(followupDate != null ? followupDate.atStartOfDay() : LocalDate.now().atStartOfDay())
                .contactId(contact.getId())
                .companyName(contact.getCompany())
                .build();
    }

    private Reminder toCooldownReminder(Application application) {
        LocalDate eligibleDate = application.getApplicationDate().plusDays(application.getCooldownPeriod());
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), eligibleDate);

        return Reminder.builder()
                .type("ACTIVE_COOLDOWN")
                .title("Cooldown active")
                .message("Wait " + daysRemaining + " day(s) before reapplying to " + application.getCompanyName())
                .dueDate(eligibleDate.atTime(LocalTime.MIN))
                .applicationId(application.getId())
                .companyName(application.getCompanyName())
                .build();
    }

    private int compareNullableDates(LocalDateTime left, LocalDateTime right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return left.compareTo(right);
    }
}
