package com.jobflow.common.config;

import com.jobflow.applications.entity.Application;
import com.jobflow.applications.enums.ApplicationStatus;
import com.jobflow.applications.enums.EmploymentType;
import com.jobflow.applications.enums.Priority;
import com.jobflow.applications.enums.WorkMode;
import com.jobflow.applications.repository.ApplicationRepository;
import com.jobflow.auth.entity.User;
import com.jobflow.auth.repository.UserRepository;
import com.jobflow.contacts.entity.Contact;
import com.jobflow.contacts.enums.ContactStatus;
import com.jobflow.contacts.enums.ContactType;
import com.jobflow.contacts.enums.HelpScore;
import com.jobflow.contacts.repository.ContactRepository;
import com.jobflow.files.entity.UploadedFile;
import com.jobflow.files.repository.UploadedFileRepository;
import com.jobflow.interviews.entity.Interview;
import com.jobflow.interviews.enums.InterviewMode;
import com.jobflow.interviews.enums.InterviewResult;
import com.jobflow.interviews.repository.InterviewRepository;
import com.jobflow.timeline.entity.Timeline;
import com.jobflow.timeline.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class SeedDataInitializer implements CommandLineRunner {

    private static final String DEMO_EMAIL = "demo@jobflow.local";
    private static final String SEED_JOB_PREFIX = "SEED-";

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final ContactRepository contactRepository;
    private final InterviewRepository interviewRepository;
    private final TimelineRepository timelineRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User demoUser = userRepository.findByEmail(DEMO_EMAIL)
                .orElseGet(() -> userRepository.save(User.builder()
                        .firstName("Demo")
                        .lastName("User")
                        .email(DEMO_EMAIL)
                        .password(passwordEncoder.encode("DemoPassword123"))
                        .build()));

        List<User> users = new ArrayList<>(userRepository.findAll());
        if (users.stream().noneMatch(user -> DEMO_EMAIL.equals(user.getEmail()))) {
            users.add(demoUser);
        }

        users.forEach(this::seedUserIfNeeded);
    }

    private void seedUserIfNeeded(User user) {
        boolean alreadySeeded = applicationRepository.existsByUserIdAndJobIdStartingWith(user.getId(), SEED_JOB_PREFIX);

        if (alreadySeeded) {
            log.info("Seed data already exists for {}", user.getEmail());
            return;
        }

        List<Application> applications = seedApplications(user);
        seedContacts(user);
        seedInterviews(applications);
        seedTimeline(applications);
        seedUploadedFiles(user, applications);

        log.info("Seeded rich demo data for {}. Demo login: {} / DemoPassword123", user.getEmail(), DEMO_EMAIL);
    }

    private List<Application> seedApplications(User user) {
        LocalDate today = LocalDate.now();
        List<ApplicationSeed> seeds = List.of(
                new ApplicationSeed("Google", "Software Engineer", "Bengaluru", WorkMode.HYBRID, EmploymentType.FULL_TIME, ApplicationStatus.APPLIED, Priority.HIGH, 4, 30, "LinkedIn"),
                new ApplicationSeed("Amazon", "Backend Engineer", "Hyderabad", WorkMode.ONSITE, EmploymentType.FULL_TIME, ApplicationStatus.OA_RECEIVED, Priority.CRITICAL, 8, 45, "Referral"),
                new ApplicationSeed("Microsoft", "Full Stack Developer", "Noida", WorkMode.HYBRID, EmploymentType.FULL_TIME, ApplicationStatus.OA_SUBMITTED, Priority.HIGH, 12, 60, "Careers page"),
                new ApplicationSeed("Netflix", "Frontend Engineer", "Remote", WorkMode.REMOTE, EmploymentType.CONTRACT, ApplicationStatus.INTERVIEW_SCHEDULED, Priority.MEDIUM, 16, 30, "Recruiter"),
                new ApplicationSeed("Meta", "Product Engineer", "Gurugram", WorkMode.HYBRID, EmploymentType.FULL_TIME, ApplicationStatus.INTERVIEW_IN_PROGRESS, Priority.HIGH, 20, 60, "LinkedIn"),
                new ApplicationSeed("Apple", "iOS Engineer", "Bengaluru", WorkMode.ONSITE, EmploymentType.FULL_TIME, ApplicationStatus.INTERVIEW_COMPLETED, Priority.MEDIUM, 24, 90, "Company site"),
                new ApplicationSeed("Stripe", "Payments Engineer", "Remote", WorkMode.REMOTE, EmploymentType.FULL_TIME, ApplicationStatus.OFFER_RECEIVED, Priority.CRITICAL, 30, 0, "Referral"),
                new ApplicationSeed("Uber", "Platform Engineer", "Hyderabad", WorkMode.HYBRID, EmploymentType.FULL_TIME, ApplicationStatus.REJECTED, Priority.LOW, 36, 30, "LinkedIn"),
                new ApplicationSeed("Airbnb", "Data Engineer", "Remote", WorkMode.REMOTE, EmploymentType.FREELANCE, ApplicationStatus.WITHDRAWN, Priority.LOW, 42, 0, "Cold apply"),
                new ApplicationSeed("Adobe", "Java Developer", "Noida", WorkMode.ONSITE, EmploymentType.PART_TIME, ApplicationStatus.HOLD, Priority.MEDIUM, 48, 15, "Alumni referral"),
                new ApplicationSeed("Atlassian", "DevOps Engineer", "Remote", WorkMode.REMOTE, EmploymentType.INTERNSHIP, ApplicationStatus.APPLIED, Priority.MEDIUM, 2, 14, "Campus portal"),
                new ApplicationSeed("Salesforce", "CRM Engineer", "Bengaluru", WorkMode.HYBRID, EmploymentType.CONTRACT, ApplicationStatus.INTERVIEW_SCHEDULED, Priority.HIGH, 6, 30, "Recruiter")
        );

        List<Application> applications = new ArrayList<>();
        for (int index = 0; index < seeds.size(); index++) {
            ApplicationSeed seed = seeds.get(index);
            applications.add(applicationRepository.save(Application.builder()
                    .user(user)
                    .userId(user.getId())
                    .companyName(seed.company())
                    .role(seed.role())
                    .jobId(SEED_JOB_PREFIX + String.format("%03d", index + 1))
                    .location(seed.location())
                    .workMode(seed.workMode())
                    .employmentType(seed.employmentType())
                    .status(seed.status())
                    .priority(seed.priority())
                    .applicationDate(today.minusDays(seed.daysAgo()))
                    .appliedThrough(seed.appliedThrough())
                    .emailUsed(user.getEmail())
                    .phoneUsed("+91-98765-43" + String.format("%03d", index))
                    .cooldownPeriod(seed.cooldownPeriod())
                    .notes("Seeded " + seed.status().getDisplayName() + " application for dashboard and filtering tests.")
                    .build()));
        }
        return applications;
    }

    private void seedContacts(User user) {
        LocalDate today = LocalDate.now();
        ContactType[] types = ContactType.values();
        ContactStatus[] statuses = ContactStatus.values();
        HelpScore[] scores = HelpScore.values();

        for (int index = 0; index < types.length; index++) {
            ContactType type = types[index];
            contactRepository.save(Contact.builder()
                    .user(user)
                    .name(seedContactName(type, index))
                    .company(seedCompany(index))
                    .role(seedContactRole(type))
                    .level(index % 2 == 0 ? "Senior" : "Lead")
                    .linkedinUrl("https://linkedin.com/in/jobflow-seed-" + index)
                    .email("seed.contact." + index + "@jobflow.local")
                    .phone("+91-90000-10" + String.format("%03d", index))
                    .contactType(type)
                    .status(statuses[index % statuses.length])
                    .helpScore(scores[Math.min(index + 3, scores.length - 1)])
                    .source(index % 2 == 0 ? "LinkedIn" : "Alumni network")
                    .notes("Seeded contact covering " + type.getDisplayName() + " and " + statuses[index % statuses.length].getDisplayName() + ".")
                    .lastContactDate(today.minusDays(index + 1L))
                    .nextFollowupDate(index % 3 == 0 ? today.minusDays(1) : today.plusDays(index + 1L))
                    .build());
        }

        contactRepository.save(Contact.builder()
                .user(user)
                .name("Nisha Referral")
                .company("Stripe")
                .role("Staff Engineer")
                .level("Staff")
                .email("nisha.referral@jobflow.local")
                .contactType(ContactType.REFERRAL)
                .status(ContactStatus.REFERRAL_GIVEN)
                .helpScore(HelpScore.TEN)
                .source("Friend of friend")
                .notes("High-value seeded referral contact.")
                .lastContactDate(today.minusDays(2))
                .nextFollowupDate(today)
                .build());
    }

    private void seedInterviews(List<Application> applications) {
        InterviewMode[] modes = InterviewMode.values();
        InterviewResult[] results = InterviewResult.values();
        LocalDateTime now = LocalDateTime.now();

        for (int index = 0; index < applications.size(); index++) {
            Application application = applications.get(index);
            interviewRepository.save(Interview.builder()
                    .application(application)
                    .roundName(seedRoundName(index))
                    .interviewDate(now.plusDays(index - 3L).withMinute(0).withSecond(0).withNano(0))
                    .mode(modes[index % modes.length])
                    .result(results[index % results.length])
                    .notes("Seeded interview using " + modes[index % modes.length].getDisplayName() + " mode and " + results[index % results.length].getDisplayName() + " result.")
                    .build());

            if (index % 3 == 0) {
                interviewRepository.save(Interview.builder()
                        .application(application)
                        .roundName("Hiring Manager Round")
                        .interviewDate(now.plusDays(index + 4L).withHour(16).withMinute(30).withSecond(0).withNano(0))
                        .mode(InterviewMode.VIDEO)
                        .result(InterviewResult.PENDING)
                        .notes("Additional upcoming seeded round for reminders.")
                        .build());
            }
        }
    }

    private void seedTimeline(List<Application> applications) {
        LocalDateTime now = LocalDateTime.now();
        for (int index = 0; index < applications.size(); index++) {
            Application application = applications.get(index);
            timelineRepository.save(Timeline.builder()
                    .application(application)
                    .event("Application Created")
                    .notes("Seeded application entry for " + application.getCompanyName() + ".")
                    .eventDate(now.minusDays(index + 10L))
                    .build());
            timelineRepository.save(Timeline.builder()
                    .application(application)
                    .event(application.getStatus().getDisplayName())
                    .notes("Status moved to " + application.getStatus().getDisplayName() + ".")
                    .eventDate(now.minusDays(index + 2L))
                    .build());
            if (application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED
                    || application.getStatus() == ApplicationStatus.INTERVIEW_IN_PROGRESS
                    || application.getStatus() == ApplicationStatus.INTERVIEW_COMPLETED) {
                timelineRepository.save(Timeline.builder()
                        .application(application)
                        .event("Interview Added")
                        .notes("Seeded interview timeline event.")
                        .eventDate(now.minusDays(index + 1L))
                        .build());
            }
            if (application.getStatus() == ApplicationStatus.OFFER_RECEIVED) {
                timelineRepository.save(Timeline.builder()
                        .application(application)
                        .event("Offer Received")
                        .notes("Seeded offer event.")
                        .eventDate(now.minusDays(1))
                        .build());
            }
            if (application.getStatus() == ApplicationStatus.REJECTED) {
                timelineRepository.save(Timeline.builder()
                        .application(application)
                        .event("Rejected")
                        .notes("Seeded rejection event.")
                        .eventDate(now.minusDays(2))
                        .build());
            }
        }
    }

    private void seedUploadedFiles(User user, List<Application> applications) {
        List<Application> fileApplications = applications.stream().limit(4).toList();
        String[] fileTypes = {"RESUME", "JD", "COVER_LETTER"};

        for (Application application : fileApplications) {
            for (String fileType : fileTypes) {
                String baseName = fileType.toLowerCase() + "_" + application.getCompanyName().toLowerCase();
                uploadedFileRepository.save(UploadedFile.builder()
                        .userId(user.getId())
                        .fileType(fileType)
                        .originalFileName(baseName + ".pdf")
                        .storedFileName("demo_user_" + application.getCompanyName().toLowerCase() + "_" + application.getJobId() + ".pdf")
                        .publicId("jobflow/seed/" + user.getId() + "/" + application.getId() + "/" + application.getJobId() + "/" + fileType.toLowerCase())
                        .fileUrl("https://res.cloudinary.com/demo/raw/upload/jobflow/seed/" + fileType.toLowerCase() + ".pdf")
                        .contentType("application/pdf")
                        .fileSize(128_000L + application.getId())
                        .companyName(application.getCompanyName())
                        .jobId(application.getJobId())
                        .build());
            }
        }
    }

    private String seedCompany(int index) {
        String[] companies = {"Google", "Amazon", "Microsoft", "Netflix", "Meta", "Apple", "Stripe", "Adobe"};
        return companies[index % companies.length];
    }

    private String seedContactName(ContactType type, int index) {
        String[] names = {"Asha", "Rahul", "Priya", "Vikram", "Meera", "Arjun", "Kavya", "Rohan"};
        return names[index % names.length] + " " + type.getDisplayName();
    }

    private String seedContactRole(ContactType type) {
        return switch (type) {
            case RECRUITER -> "Technical Recruiter";
            case HR -> "HR Partner";
            case HIRING_MANAGER -> "Engineering Manager";
            case MENTOR -> "Senior Mentor";
            case ALUMNI -> "Alumni Engineer";
            case FRIEND -> "Software Engineer";
            case COLD_MAIL -> "Team Lead";
            case REFERRAL -> "Referral Partner";
        };
    }

    private String seedRoundName(int index) {
        String[] rounds = {
                "Recruiter Screen",
                "Online Assessment",
                "Technical Round 1",
                "System Design",
                "Behavioral Round",
                "Final Bar Raiser"
        };
        return rounds[index % rounds.length];
    }

    private record ApplicationSeed(
            String company,
            String role,
            String location,
            WorkMode workMode,
            EmploymentType employmentType,
            ApplicationStatus status,
            Priority priority,
            int daysAgo,
            int cooldownPeriod,
            String appliedThrough
    ) {
    }
}
